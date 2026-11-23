package com.pulsepass.controller;

import com.pulsepass.dto.request.CreateEventRequest;
import com.pulsepass.dto.response.EventResponse;
import com.pulsepass.dto.response.EventSummaryResponse;
import com.pulsepass.dto.response.TicketResponse;
import com.pulsepass.service.EventService;
import com.pulsepass.service.TicketService;
import com.pulsepass.security.AuthorizationService;
import com.pulsepass.security.PulsePassPrincipal;
import com.pulsepass.exception.ResourceNotFoundException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
@Validated
public class EventController {
    private final EventService eventService;
    private final TicketService ticketService;
    private final AuthorizationService authorizationService;

    public EventController(
            EventService eventService,
            TicketService ticketService,
            AuthorizationService authorizationService) {
        this.eventService = eventService;
        this.ticketService = ticketService;
        this.authorizationService = authorizationService;
    }

    @PostMapping
    public ResponseEntity<EventResponse> create(@Valid @RequestBody CreateEventRequest request) {
        return ResponseEntity.status(201).body(eventService.create(request));
    }

    @GetMapping("/{eventCode}")
    public ResponseEntity<EventResponse> findByCode(
            @PathVariable String eventCode,
            @AuthenticationPrincipal PulsePassPrincipal principal) {
        EventResponse event = eventService.findByCode(eventCode);
        if (event.status() != com.pulsepass.entity.EventStatus.PUBLISHED
                && !authorizationService.canViewUnpublished(principal)) {
            throw new ResourceNotFoundException("Event not found: " + eventCode);
        }
        return ResponseEntity.ok(event);
    }

    @GetMapping("/published")
    public ResponseEntity<List<EventSummaryResponse>> findPublishedEvents() {
        return ResponseEntity.ok(eventService.findPublishedEvents());
    }

    @PatchMapping("/{eventCode}/publish")
    public ResponseEntity<EventResponse> publish(@PathVariable String eventCode) {
        return ResponseEntity.ok(eventService.publish(eventCode));
    }

    @PostMapping("/{eventCode}/artists/{artistId}")
    public ResponseEntity<EventResponse> addArtist(
            @PathVariable String eventCode, @PathVariable Long artistId) {
        return ResponseEntity.ok(eventService.addArtist(eventCode, artistId));
    }

    @GetMapping("/by-artist")
    public ResponseEntity<List<EventSummaryResponse>> findByArtist(
            @RequestParam @NotBlank(message = "Stage name is required") String stageName,
            @AuthenticationPrincipal PulsePassPrincipal principal) {
        List<EventSummaryResponse> events = eventService.findByArtist(stageName);
        if (authorizationService.canViewUnpublished(principal)) {
            return ResponseEntity.ok(events);
        }
        return ResponseEntity.ok(events.stream()
                .filter(event -> event.status()
                        == com.pulsepass.entity.EventStatus.PUBLISHED)
                .toList());
    }

    @GetMapping("/{eventCode}/tickets/paid")
    public ResponseEntity<List<TicketResponse>> findPaidTicketsByEvent(@PathVariable String eventCode) {
        return ResponseEntity.ok(ticketService.findPaidTicketsByEvent(eventCode));
    }
}
