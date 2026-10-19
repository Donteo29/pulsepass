
package com.pulsepass.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record LoginRequest(
        @NotBlank(message = "Email or username is required")
        @Size(max = 180)
        String login,

        @NotBlank(message = "Password is required")
        @Size(max = 72)
        String password
) {
}
