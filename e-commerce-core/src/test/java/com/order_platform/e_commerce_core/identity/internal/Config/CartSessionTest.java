package com.order_platform.e_commerce_core.identity.internal.Config;

import com.order_platform.e_commerce_core.cart.CartService;
import com.order_platform.e_commerce_core.cart.dto.CartResponseDto;
import com.order_platform.e_commerce_core.cart.internal.CartController;
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
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

// The cart must work with the session from a real login, and a 401 must never hand out a new session cookie
@WebMvcTest(controllers = CartController.class)
@Import(WebSecurityConfig.class)
class CartSessionTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @MockitoBean
    private CartService cartService;

    @MockitoBean
    private MyUserDetailsService userDetailsService;

    @BeforeEach
    void setUp() {
        User user = new User(1L, "ann@example.com", passwordEncoder.encode("secret1"), "Ann", "USER", 1, LocalDateTime.now());
        given(userDetailsService.loadUserByUsername(anyString())).willReturn(new UserPrinciple(user));
        given(cartService.getCart(1L)).willReturn(new CartResponseDto("c1", List.of(), null, null));
    }

    @Test
    void loginSessionCanReadCart() throws Exception {
        MvcResult login = mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                        .param("username", "ann@example.com")
                        .param("password", "secret1"))
                .andExpect(status().isOk())
                .andReturn();
        MockHttpSession session = (MockHttpSession) login.getRequest().getSession(false);

        mockMvc.perform(get("/cart").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.cartId").value("c1"));
    }

    @Test
    void unauthenticated401DoesNotCreateSession() throws Exception {
        MvcResult result = mockMvc.perform(get("/cart"))
                .andExpect(status().isUnauthorized())
                .andExpect(header().doesNotExist("Set-Cookie"))
                .andReturn();

        assertThat(result.getRequest().getSession(false)).isNull();
    }
}
