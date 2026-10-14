package com.pulsepass.controller;

import com.pulsepass.dto.response.ArtistResponse;
import com.pulsepass.service.ArtistService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ArtistController.class)
class ArtistControllerTest {
    @Autowired MockMvc mvc;
    @MockitoBean ArtistService artistService;

    @Test void findArtistByIdReturns200() throws Exception {
        when(artistService.findById(1L)).thenReturn(new ArtistResponse(1L, "Solar Beat", "Colombia", "Electronic", true));
        mvc.perform(get("/api/artists/1")).andExpect(status().isOk())
                .andExpect(jsonPath("$.stageName").value("Solar Beat"));
    }

    @Test void blankStageNameReturns400() throws Exception {
        mvc.perform(get("/api/artists/by-stage-name").param("stageName", " "))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.status").value(400));
    }
}
