package com.pulsepass.controller;

import com.pulsepass.dto.response.ArtistResponse;
import com.pulsepass.service.ArtistService;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/artists")
@Validated
public class ArtistController {
    private final ArtistService artistService;

    public ArtistController(ArtistService artistService) { this.artistService = artistService; }

    @GetMapping("/{id}")
    public ResponseEntity<ArtistResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(artistService.findById(id));
    }

    @GetMapping("/by-stage-name")
    public ResponseEntity<ArtistResponse> findByStageName(
            @RequestParam @NotBlank(message = "Stage name is required") String stageName) {
        return ResponseEntity.ok(artistService.findByStageName(stageName));
    }

    @GetMapping("/active")
    public ResponseEntity<List<ArtistResponse>> findActiveArtists() {
        return ResponseEntity.ok(artistService.findActiveArtists());
    }
}
