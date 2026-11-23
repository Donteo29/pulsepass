package com.pulsepass.service.impl;

import com.pulsepass.dto.request.CreateEventRequest;
import com.pulsepass.dto.response.EventResponse;
import com.pulsepass.entity.Artist;
import com.pulsepass.entity.Event;
import com.pulsepass.entity.EventCategory;
import com.pulsepass.entity.EventStatus;
import com.pulsepass.entity.Venue;
import com.pulsepass.exception.BusinessRuleException;
import com.pulsepass.exception.ResourceNotFoundException;
import com.pulsepass.mapper.EventMapper;
import com.pulsepass.repository.ArtistRepository;
import com.pulsepass.repository.EventRepository;
import com.pulsepass.repository.VenueRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Clock;
import java.time.Instant;
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
class EventServiceImplTest {

    private static final LocalDateTime NOW = LocalDateTime.of(2026, 1, 1, 12, 0);

    @Mock
    private EventRepository eventRepository;

    @Mock
    private VenueRepository venueRepository;

    @Mock
    private ArtistRepository artistRepository;

    @Mock
    private EventMapper eventMapper;

    private EventServiceImpl service;

    @BeforeEach
    void setUp() {
        service = new EventServiceImpl(
                eventRepository,
                venueRepository,
                artistRepository,
                eventMapper,
                Clock.fixed(Instant.parse("2026-01-01T12:00:00Z"), ZoneOffset.UTC)
        );
    }

    @Test
    void findByCodeReturnsMappedResponse() {
        Event event = event(EventStatus.PUBLISHED, NOW.plusDays(10));
        EventResponse response = new EventResponse(null, "CMF-2026", "Fest", null, null,
                null, null, null, null, null, java.util.List.of());
        when(eventRepository.findByEventCode("CMF-2026")).thenReturn(Optional.of(event));
        when(eventMapper.toResponse(event)).thenReturn(response);

        assertThat(service.findByCode("CMF-2026")).isSameAs(response);
        verify(eventMapper).toResponse(event);
    }

    @Test
    void findByCodeThrowsWhenEventDoesNotExist() {
        when(eventRepository.findByEventCode("MISSING")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.findByCode("MISSING"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Event not found: MISSING");
        verify(eventMapper, never()).toResponse(any());
    }

    @Test
    void createStartsEventInDraft() {
        Venue venue = venue(true);
        CreateEventRequest request = new CreateEventRequest(
                "CMF-2026", "Fest", "Description", EventCategory.MUSIC,
                NOW.plusDays(10), 18, "VEN-01"
        );
        when(eventRepository.existsByEventCode("CMF-2026")).thenReturn(false);
        when(venueRepository.findByCode("VEN-01")).thenReturn(Optional.of(venue));
        when(eventRepository.save(any(Event.class))).thenAnswer(invocation -> invocation.getArgument(0));

        service.create(request);

        ArgumentCaptor<Event> captor = ArgumentCaptor.forClass(Event.class);
        verify(eventRepository).save(captor.capture());
        assertThat(captor.getValue().getStatus()).isEqualTo(EventStatus.DRAFT);
        assertThat(captor.getValue().getVenue()).isSameAs(venue);
    }

    @Test
    void createWithMissingVenueDoesNotSave() {
        CreateEventRequest request = new CreateEventRequest(
                "CMF-2026", "Fest", "Description", EventCategory.MUSIC,
                NOW.plusDays(10), 18, "MISSING"
        );
        when(eventRepository.existsByEventCode("CMF-2026")).thenReturn(false);
        when(venueRepository.findByCode("MISSING")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.create(request))
                .isInstanceOf(ResourceNotFoundException.class);
        verify(eventRepository, never()).save(any());
    }

    @Test
    void createWithPastDateFails() {
        CreateEventRequest request = new CreateEventRequest(
                "CMF-2026", "Fest", "Description", EventCategory.MUSIC,
                NOW.minusMinutes(1), 18, "VEN-01"
        );
        when(eventRepository.existsByEventCode("CMF-2026")).thenReturn(false);

        assertThatThrownBy(() -> service.create(request))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessage("Event date must be in the future.");
        verify(venueRepository, never()).findByCode(any());
        verify(eventRepository, never()).save(any());
    }

    @Test
    void publishDraftEventChangesStatus() {
        Event event = event(EventStatus.DRAFT, NOW.plusDays(10));
        when(eventRepository.findByEventCode("CMF-2026")).thenReturn(Optional.of(event));
        when(eventRepository.save(event)).thenReturn(event);

        service.publish("CMF-2026");

        assertThat(event.getStatus()).isEqualTo(EventStatus.PUBLISHED);
        verify(eventRepository).save(event);
    }

    @Test
    void publishCancelledEventFailsWithoutSaving() {
        Event event = event(EventStatus.CANCELLED, NOW.plusDays(10));
        when(eventRepository.findByEventCode("CMF-2026")).thenReturn(Optional.of(event));

        assertThatThrownBy(() -> service.publish("CMF-2026"))
                .isInstanceOf(BusinessRuleException.class);
        verify(eventRepository, never()).save(any());
    }

    @Test
    void addArtistRejectsDuplicateAssociation() {
        Event event = event(EventStatus.DRAFT, NOW.plusDays(10));
        Artist artist = new Artist("Solar Beat", "Colombia", "Electronic", true);
        event.addArtist(artist);
        when(eventRepository.findByEventCode("CMF-2026")).thenReturn(Optional.of(event));
        when(artistRepository.findById(null)).thenReturn(Optional.of(artist));

        assertThatThrownBy(() -> service.addArtist("CMF-2026", null))
                .isInstanceOf(BusinessRuleException.class);
        verify(eventRepository, never()).save(any());
    }

    private Event event(EventStatus status, LocalDateTime date) {
        return new Event("CMF-2026", "Fest", "Description", EventCategory.MUSIC,
                status, date, 18, venue(true));
    }

    private Venue venue(boolean active) {
        return new Venue("VEN-01", "Venue", "Santa Marta", "Address", 2, active);
    }
}
