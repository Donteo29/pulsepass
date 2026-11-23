package com.pulsepass.service.impl;

import com.pulsepass.dto.response.ArtistResponse;
import com.pulsepass.entity.Artist;
import com.pulsepass.exception.ResourceNotFoundException;
import com.pulsepass.mapper.ArtistMapper;
import com.pulsepass.repository.ArtistRepository;
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
class ArtistServiceImplTest {
    @Mock ArtistRepository artistRepository;
    @Mock ArtistMapper artistMapper;

    private ArtistServiceImpl service() {
        return new ArtistServiceImpl(artistRepository, artistMapper);
    }

    @Test
    void findByIdMapsTheArtist() {
        Artist artist = new Artist("Solar Beat", "Colombia", "Electronic", true);
        ArtistResponse response = new ArtistResponse(1L, "Solar Beat", "Colombia", "Electronic", true);
        when(artistRepository.findById(1L)).thenReturn(Optional.of(artist));
        when(artistMapper.toResponse(artist)).thenReturn(response);

        assertThat(service().findById(1L)).isSameAs(response);
    }

    @Test
    void findByStageNameRaisesNotFoundWhenMissing() {
        when(artistRepository.findByStageNameIgnoreCase("Unknown")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service().findByStageName("Unknown"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Artist not found: Unknown");
    }

    @Test
    void findActiveArtistsMapsRepositoryResults() {
        Artist artist = new Artist("Solar Beat", "Colombia", "Electronic", true);
        ArtistResponse response = new ArtistResponse(1L, "Solar Beat", "Colombia", "Electronic", true);
        when(artistRepository.findByActiveTrueOrderByStageNameAsc()).thenReturn(List.of(artist));
        when(artistMapper.toResponse(artist)).thenReturn(response);

        assertThat(service().findActiveArtists()).containsExactly(response);
        verify(artistRepository).findByActiveTrueOrderByStageNameAsc();
    }
}
