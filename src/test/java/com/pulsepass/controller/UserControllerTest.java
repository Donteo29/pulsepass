package com.pulsepass.controller;

import com.pulsepass.dto.response.UserResponse;
import com.pulsepass.service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import java.time.LocalDate;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(UserController.class)
class UserControllerTest {
    @Autowired MockMvc mvc;
    @MockitoBean UserService userService;

    @Test void findUserByEmailReturns200() throws Exception {
        when(userService.findByEmail("andrea@example.com")).thenReturn(
                new UserResponse(1L, "andrea", "andrea@example.com", true, "Andrea", "Perez", null, null, LocalDate.of(1994, 2, 3)));
        mvc.perform(get("/api/users/by-email").param("email", "andrea@example.com"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.username").value("andrea"));
    }

    @Test void invalidEmailReturns400AndDoesNotCallService() throws Exception {
        mvc.perform(get("/api/users/by-email").param("email", "not-an-email"))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.status").value(400));
    }
}
