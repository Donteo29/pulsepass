package com.pulsepass.dto.request;

import com.pulsepass.entity.TicketType;

public record PurchaseTicketRequest(
        String userEmail,
        String eventCode,
        TicketType type
) {
}
