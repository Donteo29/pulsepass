package com.pulsepass.mapper;

import com.pulsepass.dto.response.ArtistResponse;
import com.pulsepass.entity.Artist;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ArtistMapper {

    ArtistResponse toResponse(Artist artist);
}
