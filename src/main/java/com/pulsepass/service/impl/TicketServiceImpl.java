package com.pulsepass.service.impl;

import com.pulsepass.dto.request.PurchaseTicketRequest;
import com.pulsepass.dto.response.TicketResponse;
import com.pulsepass.entity.Event;
import com.pulsepass.entity.EventStatus;
import com.pulsepass.entity.Ticket;
import com.pulsepass.entity.TicketStatus;
import com.pulsepass.entity.TicketType;
import com.pulsepass.entity.User;
import com.pulsepass.entity.UserProfile;
import com.pulsepass.exception.BusinessRuleException;
import com.pulsepass.exception.ResourceNotFoundException;
import com.pulsepass.mapper.TicketMapper;
import com.pulsepass.repository.EventRepository;
import com.pulsepass.repository.TicketRepository;
import com.pulsepass.repository.UserRepository;
import com.pulsepass.service.TicketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.util.List;
import java.util.UUID;

@Service
public class TicketServiceImpl implements TicketService {

    private static final BigDecimal GENERAL_PRICE = new BigDecimal("120000.00");
    private static final BigDecimal STUDENT_PRICE = new BigDecimal("60000.00");
    private static final BigDecimal VIP_PRICE = new BigDecimal("250000.00");
    private static final BigDecimal BACKSTAGE_PRICE = new BigDecimal("400000.00");

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final TicketMapper ticketMapper;
    private final Clock clock;

    @Autowired
    public TicketServiceImpl(TicketRepository ticketRepository,
                             UserRepository userRepository,
                             EventRepository eventRepository,
                             TicketMapper ticketMapper,
                             Clock clock) {
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.eventRepository = eventRepository;
        this.ticketMapper = ticketMapper;
        this.clock = clock;
    }

    public TicketServiceImpl(TicketRepository ticketRepository,
                             UserRepository userRepository,
                             EventRepository eventRepository,
                             TicketMapper ticketMapper) {
        this(ticketRepository, userRepository, eventRepository, ticketMapper, Clock.systemDefaultZone());
    }

    @Override
    @Transactional
    public TicketResponse purchase(PurchaseTicketRequest request) {
        if (request == null || request.type() == null) {
            throw new BusinessRuleException("Ticket type is required.");
        }

        User user = userRepository.findByEmailIgnoreCase(request.userEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + request.userEmail()));
        if (!Boolean.TRUE.equals(user.getActive())) {
            throw new BusinessRuleException("Inactive users cannot purchase tickets.");
        }

        Event event = eventRepository.findByEventCode(request.eventCode())
                .orElseThrow(() -> new ResourceNotFoundException("Event not found: " + request.eventCode()));
        if (event.getStatus() != EventStatus.PUBLISHED) {
            throw new BusinessRuleException("Tickets can only be purchased for PUBLISHED events.");
        }

        LocalDateTime now = LocalDateTime.now(clock);
        if (!event.getEventDate().isAfter(now)) {
            throw new BusinessRuleException("Tickets cannot be purchased after the event date.");
        }
        validateMinimumAge(user, event);

        long paidTickets = ticketRepository.countByEventEventCodeAndStatus(event.getEventCode(), TicketStatus.PAID);
        if (paidTickets >= event.getVenue().getCapacity()) {
            throw new BusinessRuleException("Event capacity has been reached: " + event.getEventCode());
        }

        Ticket ticket = new Ticket(
                generateTicketCode(),
                request.type(),
                calculatePrice(request.type()),
                TicketStatus.PAID,
                now,
                user,
                event
        );
        Ticket savedTicket = ticketRepository.save(ticket);

        if (paidTickets + 1 == event.getVenue().getCapacity()) {
            event.setStatus(EventStatus.SOLD_OUT);
            eventRepository.save(event);
        }
        return ticketMapper.toResponse(savedTicket);
    }

    @Override
    @Transactional(readOnly = true)
    public TicketResponse findByCode(String ticketCode) {
        return ticketRepository.findByTicketCode(ticketCode)
                .map(ticketMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + ticketCode));
    }

    @Override
    @Transactional(readOnly = true)
    public List<TicketResponse> findByUserEmail(String email) {
        return ticketRepository.findByUserEmailIgnoreCaseOrderByPurchaseDateDesc(email)
                .stream()
                .map(ticketMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<TicketResponse> findPaidTicketsByEvent(String eventCode) {
        return ticketRepository.findByStatusAndEvent_EventCode(TicketStatus.PAID, eventCode)
                .stream()
                .map(ticketMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public TicketResponse cancel(String ticketCode) {
        Ticket ticket = findEntity(ticketCode);
        if (ticket.getStatus() != TicketStatus.PAID) {
            throw new BusinessRuleException("Only PAID tickets can be cancelled: " + ticketCode);
        }
        if (!LocalDateTime.now(clock).isBefore(ticket.getEvent().getEventDate())) {
            throw new BusinessRuleException("Tickets cannot be cancelled after the event date: " + ticketCode);
        }

        ticket.setStatus(TicketStatus.CANCELLED);
        return ticketMapper.toResponse(ticketRepository.save(ticket));
    }

    @Override
    @Transactional
    public TicketResponse markAsUsed(String ticketCode) {
        Ticket ticket = findEntity(ticketCode);
        if (ticket.getStatus() != TicketStatus.PAID) {
            throw new BusinessRuleException("Only PAID tickets can be marked as used: " + ticketCode);
        }

        ticket.setStatus(TicketStatus.USED);
        return ticketMapper.toResponse(ticketRepository.save(ticket));
    }

    private Ticket findEntity(String ticketCode) {
        return ticketRepository.findByTicketCode(ticketCode)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + ticketCode));
    }

    private void validateMinimumAge(User user, Event event) {
        if (event.getMinimumAge() == null || event.getMinimumAge() == 0) {
            return;
        }

        UserProfile profile = user.getProfile();
        if (profile == null || profile.getBirthDate() == null) {
            throw new BusinessRuleException("User profile is required to validate minimum age.");
        }
        LocalDate eventDate = event.getEventDate().toLocalDate();
        int age = Period.between(profile.getBirthDate(), eventDate).getYears();
        if (age < event.getMinimumAge()) {
            throw new BusinessRuleException("User does not meet minimum age.");
        }
    }

    private BigDecimal calculatePrice(TicketType type) {
        return switch (type) {
            case GENERAL -> GENERAL_PRICE;
            case STUDENT -> STUDENT_PRICE;
            case VIP -> VIP_PRICE;
            case BACKSTAGE -> BACKSTAGE_PRICE;
        };
    }

    private String generateTicketCode() {
        return "TCK-" + UUID.randomUUID();
    }
}
