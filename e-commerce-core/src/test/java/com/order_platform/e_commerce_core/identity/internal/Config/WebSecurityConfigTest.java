package com.order_platform.e_commerce_core.identity.internal.Config;

import com.order_platform.e_commerce_core.identity.AuthService;
import com.order_platform.e_commerce_core.identity.internal.AuthController;
import com.order_platform.e_commerce_core.identity.internal.MyUserDetailsService;
import com.order_platform.e_commerce_core.identity.internal.User;
import com.order_platform.e_commerce_core.identity.internal.UserPrinciple;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalDateTime;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

// Verifies the SPA-friendly auth contract: JSON + status codes, never redirects
@WebMvcTest(controllers = AuthController.class)
@Import(WebSecurityConfig.class)
class WebSecurityConfigTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @MockitoBean
    private AuthService authService;

    @MockitoBean
    private MyUserDetailsService userDetailsService;

    @BeforeEach
    void setUp() {
        User user = new User(1L, "ann@example.com", passwordEncoder.encode("secret1"), "Ann", "USER", 1, LocalDateTime.now());
        given(userDetailsService.loadUserByUsername(anyString())).willReturn(new UserPrinciple(user));
    }

    @Test
    void protectedEndpointsReturn401InsteadOfRedirect() throws Exception {
        mockMvc.perform(get("/auth/me")).andExpect(status().isUnauthorized());
        mockMvc.perform(get("/cart")).andExpect(status().isUnauthorized());
    }

    @Test
    void wrongPasswordReturns401Json() throws Exception {
        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                        .param("username", "ann@example.com")
                        .param("password", "wrong"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Invalid email or password"));
    }

    @Test
    void loginReturnsUserAndSessionWorksForMeAndLogout() throws Exception {
        MvcResult login = mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                        .param("username", "ann@example.com")
                        .param("password", "secret1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("ann@example.com"))
                .andExpect(jsonPath("$.name").value("Ann"))
                .andReturn();
        MockHttpSession session = (MockHttpSession) login.getRequest().getSession(false);

        mockMvc.perform(get("/auth/me").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));

        mockMvc.perform(post("/auth/logout").session(session)).andExpect(status().isNoContent());
    }

    @Test
    void registerIsPublicAndValidated() throws Exception {
        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"not-an-email\",\"password\":\"123\",\"name\":\"\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    void duplicateEmailReturns409() throws Exception {
        given(authService.register(any())).willThrow(new IllegalArgumentException("User with this email already exists"));

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"ann@example.com\",\"password\":\"secret1\",\"name\":\"Ann\"}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("User with this email already exists"));
    }
}
