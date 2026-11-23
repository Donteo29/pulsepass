package com.pulsepass.service.impl;

import com.pulsepass.dto.response.VenueResponse;
import com.pulsepass.entity.Venue;
import com.pulsepass.exception.ResourceNotFoundException;
import com.pulsepass.mapper.VenueMapper;
import com.pulsepass.repository.VenueRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class VenueServiceImplTest {
    @Mock VenueRepository venueRepository;
    @Mock VenueMapper venueMapper;

    private VenueServiceImpl service() {
        return new VenueServiceImpl(venueRepository, venueMapper);
    }

    @Test
    void findByCodeMapsTheVenue() {
        Venue venue = new Venue("VEN-SMR-01", "Marina Center", "Santa Marta", "Calle 1", 500, true);
        VenueResponse response = new VenueResponse(1L, "VEN-SMR-01", "Marina Center", "Santa Marta", "Calle 1", 500, true);
        when(venueRepository.findByCode("VEN-SMR-01")).thenReturn(Optional.of(venue));
        when(venueMapper.toResponse(venue)).thenReturn(response);

        assertThat(service().findByCode("VEN-SMR-01")).isSameAs(response);
    }

    @Test
    void findByCodeRaisesNotFoundWhenMissing() {
        when(venueRepository.findByCode("MISSING")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service().findByCode("MISSING"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Venue not found: MISSING");
    }

    @Test
    void findActiveVenuesMapsRepositoryResults() {
        Venue venue = new Venue("VEN-SMR-01", "Marina Center", "Santa Marta", "Calle 1", 500, true);
        VenueResponse response = new VenueResponse(1L, "VEN-SMR-01", "Marina Center", "Santa Marta", "Calle 1", 500, true);
        when(venueRepository.findByActiveTrueOrderByNameAsc()).thenReturn(List.of(venue));
        when(venueMapper.toResponse(venue)).thenReturn(response);

        assertThat(service().findActiveVenues()).containsExactly(response);
        verify(venueRepository).findByActiveTrueOrderByNameAsc();
    }
}
