package com.pulsepass.dto.response;

import com.pulsepass.entity.EventCategory;
import com.pulsepass.entity.EventStatus;

import java.time.LocalDateTime;

public record EventSummaryResponse(
        Long id,
        String eventCode,
        String name,
        EventCategory category,
        EventStatus status,
        LocalDateTime eventDate,
        String venueCode,
        String venueName
) {
}
