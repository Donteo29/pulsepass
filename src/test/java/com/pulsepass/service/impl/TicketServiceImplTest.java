package com.pulsepass.service.impl;

import com.pulsepass.dto.request.PurchaseTicketRequest;
import com.pulsepass.dto.response.TicketResponse;
import com.pulsepass.entity.Event;
import com.pulsepass.entity.EventCategory;
import com.pulsepass.entity.EventStatus;
import com.pulsepass.entity.Ticket;
import com.pulsepass.entity.TicketStatus;
import com.pulsepass.entity.TicketType;
import com.pulsepass.entity.User;
import com.pulsepass.entity.UserProfile;
import com.pulsepass.entity.Venue;
import com.pulsepass.exception.BusinessRuleException;
import com.pulsepass.mapper.TicketMapper;
import com.pulsepass.repository.EventRepository;
import com.pulsepass.repository.TicketRepository;
import com.pulsepass.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TicketServiceImplTest {

    private static final LocalDateTime NOW = LocalDateTime.of(2026, 1, 1, 12, 0);

    @Mock
    private TicketRepository ticketRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private EventRepository eventRepository;

    @Mock
    private TicketMapper ticketMapper;

    private TicketServiceImpl service;

    @BeforeEach
    void setUp() {
        service = new TicketServiceImpl(
                ticketRepository,
                userRepository,
                eventRepository,
                ticketMapper,
                Clock.fixed(Instant.parse("2026-01-01T12:00:00Z"), ZoneOffset.UTC)
        );
    }

    @Test
    void purchaseCreatesPaidTicketWithCalculatedPrice() {
        User user = user(true, LocalDate.of(1994, 2, 3));
        Event event = event(EventStatus.PUBLISHED, 2);
        PurchaseTicketRequest request = new PurchaseTicketRequest("andrea@example.com", "CMF-2026", TicketType.VIP);
        TicketResponse response = new TicketResponse(null, "TCK-1", TicketType.VIP,
                null, TicketStatus.PAID, NOW, request.userEmail(), request.eventCode(), event.getName());
        when(userRepository.findByEmailIgnoreCase(request.userEmail())).thenReturn(Optional.of(user));
        when(eventRepository.findByEventCode(request.eventCode())).thenReturn(Optional.of(event));
        when(ticketRepository.countByEventEventCodeAndStatus("CMF-2026", TicketStatus.PAID)).thenReturn(0L);
        when(ticketRepository.save(any(Ticket.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(ticketMapper.toResponse(any(Ticket.class))).thenReturn(response);

        assertThat(service.purchase(request)).isSameAs(response);

        ArgumentCaptor<Ticket> captor = ArgumentCaptor.forClass(Ticket.class);
        verify(ticketRepository).save(captor.capture());
        assertThat(captor.getValue().getStatus()).isEqualTo(TicketStatus.PAID);
        assertThat(captor.getValue().getPrice()).isEqualByComparingTo("250000.00");
        verify(eventRepository, never()).save(any(Event.class));
    }

    @Test
    void inactiveUserCannotPurchase() {
        User user = user(false, LocalDate.of(1994, 2, 3));
        when(userRepository.findByEmailIgnoreCase("andrea@example.com")).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> service.purchase(
                new PurchaseTicketRequest("andrea@example.com", "CMF-2026", TicketType.GENERAL)))
                .isInstanceOf(BusinessRuleException.class);
        verify(eventRepository, never()).findByEventCode(any());
        verify(ticketRepository, never()).save(any());
    }

    @Test
    void draftEventCannotBePurchased() {
        User user = user(true, LocalDate.of(1994, 2, 3));
        Event event = event(EventStatus.DRAFT, 2);
        when(userRepository.findByEmailIgnoreCase("andrea@example.com")).thenReturn(Optional.of(user));
        when(eventRepository.findByEventCode("CMF-2026")).thenReturn(Optional.of(event));

        assertThatThrownBy(() -> service.purchase(
                new PurchaseTicketRequest("andrea@example.com", "CMF-2026", TicketType.GENERAL)))
                .isInstanceOf(BusinessRuleException.class);
        verify(ticketRepository, never()).countByEventEventCodeAndStatus(any(), any());
        verify(ticketRepository, never()).save(any());
    }

    @Test
    void minorCannotPurchaseEventWithMinimumAge() {
        User user = user(true, LocalDate.of(2010, 1, 2));
        Event event = event(EventStatus.PUBLISHED, 2);
        when(userRepository.findByEmailIgnoreCase("andrea@example.com")).thenReturn(Optional.of(user));
        when(eventRepository.findByEventCode("CMF-2026")).thenReturn(Optional.of(event));

        assertThatThrownBy(() -> service.purchase(
                new PurchaseTicketRequest("andrea@example.com", "CMF-2026", TicketType.GENERAL)))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessage("User does not meet minimum age.");
        verify(ticketRepository, never()).countByEventEventCodeAndStatus(any(), any());
        verify(ticketRepository, never()).save(any());
    }

    @Test
    void finalAvailableTicketMarksEventSoldOut() {
        User user = user(true, LocalDate.of(1994, 2, 3));
        Event event = event(EventStatus.PUBLISHED, 2);
        when(userRepository.findByEmailIgnoreCase("andrea@example.com")).thenReturn(Optional.of(user));
        when(eventRepository.findByEventCode("CMF-2026")).thenReturn(Optional.of(event));
        when(ticketRepository.countByEventEventCodeAndStatus("CMF-2026", TicketStatus.PAID)).thenReturn(1L);
        when(ticketRepository.save(any(Ticket.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(ticketMapper.toResponse(any(Ticket.class))).thenReturn(null);

        service.purchase(new PurchaseTicketRequest("andrea@example.com", "CMF-2026", TicketType.GENERAL));

        assertThat(event.getStatus()).isEqualTo(EventStatus.SOLD_OUT);
        verify(eventRepository).save(event);
    }

    @Test
    void fullEventRejectsPurchaseWithoutSaving() {
        User user = user(true, LocalDate.of(1994, 2, 3));
        Event event = event(EventStatus.PUBLISHED, 2);
        when(userRepository.findByEmailIgnoreCase("andrea@example.com")).thenReturn(Optional.of(user));
        when(eventRepository.findByEventCode("CMF-2026")).thenReturn(Optional.of(event));
        when(ticketRepository.countByEventEventCodeAndStatus("CMF-2026", TicketStatus.PAID)).thenReturn(2L);

        assertThatThrownBy(() -> service.purchase(
                new PurchaseTicketRequest("andrea@example.com", "CMF-2026", TicketType.GENERAL)))
                .isInstanceOf(BusinessRuleException.class);
        verify(ticketRepository, never()).save(any());
        verify(eventRepository, never()).save(any());
    }

    @Test
    void cancelPaidTicketChangesStatus() {
        Ticket ticket = ticket(TicketStatus.PAID);
        when(ticketRepository.findByTicketCode("TCK-1")).thenReturn(Optional.of(ticket));
        when(ticketRepository.save(ticket)).thenReturn(ticket);
        when(ticketMapper.toResponse(ticket)).thenReturn(null);

        service.cancel("TCK-1");

        assertThat(ticket.getStatus()).isEqualTo(TicketStatus.CANCELLED);
        verify(ticketRepository).save(ticket);
    }

    @Test
    void usedTicketCannotBeCancelled() {
        Ticket ticket = ticket(TicketStatus.USED);
        when(ticketRepository.findByTicketCode("TCK-1")).thenReturn(Optional.of(ticket));

        assertThatThrownBy(() -> service.cancel("TCK-1"))
                .isInstanceOf(BusinessRuleException.class);
        verify(ticketRepository, never()).save(any());
    }

    @Test
    void paidTicketCanBeMarkedAsUsed() {
        Ticket ticket = ticket(TicketStatus.PAID);
        when(ticketRepository.findByTicketCode("TCK-1")).thenReturn(Optional.of(ticket));
        when(ticketRepository.save(ticket)).thenReturn(ticket);
        when(ticketMapper.toResponse(ticket)).thenReturn(null);

        service.markAsUsed("TCK-1");

        assertThat(ticket.getStatus()).isEqualTo(TicketStatus.USED);
        verify(ticketRepository).save(ticket);
    }

    @Test
    void cancelledTicketCannotBeUsed() {
        Ticket ticket = ticket(TicketStatus.CANCELLED);
        when(ticketRepository.findByTicketCode("TCK-1")).thenReturn(Optional.of(ticket));

        assertThatThrownBy(() -> service.markAsUsed("TCK-1"))
                .isInstanceOf(BusinessRuleException.class);
        verify(ticketRepository, never()).save(any());
    }

    private User user(boolean active, LocalDate birthDate) {
        User user = new User("andrea", "andrea@example.com", active);
        new UserProfile("Andrea", "Perez", null, "Santa Marta", birthDate, user);
        return user;
    }

    private Event event(EventStatus status, int capacity) {
        return new Event("CMF-2026", "Caribbean Music Fest", "Description", EventCategory.MUSIC,
                status, NOW.plusDays(30), 18,
                new Venue("VEN-01", "Venue", "Santa Marta", "Address", capacity, true));
    }

    private Ticket ticket(TicketStatus status) {
        return new Ticket("TCK-1", TicketType.GENERAL, new java.math.BigDecimal("120000.00"), status,
                NOW, user(true, LocalDate.of(1994, 2, 3)), event(EventStatus.PUBLISHED, 2));
    }
}
