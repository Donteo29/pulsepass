package com.pulsepass.service.impl;

import com.pulsepass.dto.request.CreateEventRequest;
import com.pulsepass.dto.response.EventResponse;
import com.pulsepass.dto.response.EventSummaryResponse;
import com.pulsepass.entity.Artist;
import com.pulsepass.entity.Event;
import com.pulsepass.entity.EventStatus;
import com.pulsepass.entity.Venue;
import com.pulsepass.exception.BusinessRuleException;
import com.pulsepass.exception.DuplicateResourceException;
import com.pulsepass.exception.ResourceNotFoundException;
import com.pulsepass.mapper.EventMapper;
import com.pulsepass.repository.ArtistRepository;
import com.pulsepass.repository.EventRepository;
import com.pulsepass.repository.VenueRepository;
import com.pulsepass.service.EventService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class EventServiceImpl implements EventService {

    private final EventRepository eventRepository;
    private final VenueRepository venueRepository;
    private final ArtistRepository artistRepository;
    private final EventMapper eventMapper;
    private final Clock clock;

    @Autowired
    public EventServiceImpl(EventRepository eventRepository,
                            VenueRepository venueRepository,
                            ArtistRepository artistRepository,
                            EventMapper eventMapper,
                            Clock clock) {
        this.eventRepository = eventRepository;
        this.venueRepository = venueRepository;
        this.artistRepository = artistRepository;
        this.eventMapper = eventMapper;
        this.clock = clock;
    }

    public EventServiceImpl(EventRepository eventRepository,
                            VenueRepository venueRepository,
                            ArtistRepository artistRepository,
                            EventMapper eventMapper) {
        this(eventRepository, venueRepository, artistRepository, eventMapper, Clock.systemDefaultZone());
    }

    @Override
    @Transactional
    public EventResponse create(CreateEventRequest request) {
        if (request == null) {
            throw new BusinessRuleException("Event request is required.");
        }
        if (eventRepository.existsByEventCode(request.eventCode())) {
            throw new DuplicateResourceException("Event code already exists: " + request.eventCode());
        }
        if (request.eventDate() == null || !request.eventDate().isAfter(LocalDateTime.now(clock))) {
            throw new BusinessRuleException("Event date must be in the future.");
        }
        if (request.minimumAge() == null || request.minimumAge() < 0) {
            throw new BusinessRuleException("Minimum age must be greater than or equal to zero.");
        }
        if (request.category() == null) {
            throw new BusinessRuleException("Event category is required.");
        }

        Venue venue = venueRepository.findByCode(request.venueCode())
                .orElseThrow(() -> new ResourceNotFoundException("Venue not found: " + request.venueCode()));
        if (!Boolean.TRUE.equals(venue.getActive())) {
            throw new BusinessRuleException("Venue is inactive: " + request.venueCode());
        }

        Event event = new Event(
                request.eventCode(),
                request.name(),
                request.description(),
                request.category(),
                EventStatus.DRAFT,
                request.eventDate(),
                request.minimumAge(),
                venue
        );
        return eventMapper.toResponse(eventRepository.save(event));
    }

    @Override
    @Transactional(readOnly = true)
    public EventResponse findByCode(String eventCode) {
        return eventRepository.findByEventCode(eventCode)
                .map(eventMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found: " + eventCode));
    }

    @Override
    @Transactional(readOnly = true)
    public List<EventSummaryResponse> findPublishedEvents() {
        return eventRepository.findByStatusOrderByEventDateAsc(EventStatus.PUBLISHED)
                .stream()
                .map(eventMapper::toSummary)
                .toList();
    }

    @Override
    @Transactional
    public EventResponse publish(String eventCode) {
        Event event = findEntity(eventCode);
        if (event.getStatus() != EventStatus.DRAFT) {
            throw new BusinessRuleException("Only DRAFT events can be published: " + eventCode);
        }
        if (!event.getEventDate().isAfter(LocalDateTime.now(clock))) {
            throw new BusinessRuleException("Event date must be in the future: " + eventCode);
        }
        if (!Boolean.TRUE.equals(event.getVenue().getActive())) {
            throw new BusinessRuleException("Venue is inactive: " + event.getVenue().getCode());
        }

        event.setStatus(EventStatus.PUBLISHED);
        return eventMapper.toResponse(eventRepository.save(event));
    }

    @Override
    @Transactional
    public EventResponse addArtist(String eventCode, Long artistId) {
        Event event = findEntity(eventCode);
        if (event.getStatus() == EventStatus.CANCELLED || event.getStatus() == EventStatus.FINISHED) {
            throw new BusinessRuleException("Artists cannot be added to a " + event.getStatus() + " event.");
        }

        Artist artist = artistRepository.findById(artistId)
                .orElseThrow(() -> new ResourceNotFoundException("Artist not found: " + artistId));
        boolean alreadyAssociated = event.getArtists().stream()
                .anyMatch(existing -> existing == artist
                        || (existing.getId() != null && existing.getId().equals(artist.getId())));
        if (alreadyAssociated) {
            throw new BusinessRuleException("Artist is already associated with event: " + eventCode);
        }

        event.addArtist(artist);
        return eventMapper.toResponse(eventRepository.save(event));
    }

    @Override
    @Transactional(readOnly = true)
    public List<EventSummaryResponse> findByArtist(String stageName) {
        return eventRepository.findDistinctByArtistStageName(stageName)
                .stream()
                .map(eventMapper::toSummary)
                .toList();
    }

    private Event findEntity(String eventCode) {
        return eventRepository.findByEventCode(eventCode)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found: " + eventCode));
    }
}
