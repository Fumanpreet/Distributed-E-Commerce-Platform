package com.order_platform.e_commerce_core.identity.internal.Config;

import com.order_platform.e_commerce_core.identity.internal.UserPrinciple;
import com.order_platform.e_commerce_core.identity.dto.UserResponseDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.logout.HttpStatusReturningLogoutSuccessHandler;
import tools.jackson.databind.ObjectMapper;

import java.time.Instant;
import java.util.Map;

@Configuration
@EnableWebSecurity
class WebSecurityConfig {
    // TODO
    // Implement the JWT token implementation

    @Value("${security.bcrypt.strength:10}") // 10 is the fallback default value
    private int bcryptStrength;

    /*
     * Session-cookie auth for the React frontend (JSESSIONID).
     * Login/logout/unauthenticated responses are JSON + status codes instead of redirects,
     * so the SPA can handle them itself.
     */
    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http, ObjectMapper objectMapper) {
        http
                .csrf(AbstractHttpConfigurer::disable)
                // No saved-request cache: an SPA has nothing to redirect back to, and caching made every
                // unauthenticated 401 create a fresh session + Set-Cookie that overwrote a logged-in JSESSIONID
                // (the cookie is shared by localhost:5173 and localhost:8080)
                .requestCache((cache) -> cache.disable())
                .authorizeHttpRequests((requests) -> requests
                        .requestMatchers(
                                "/",
                                "/error",
                                "/auth/register",
                                "/auth/login",
                                "/catalog/**",

                                // Swagger
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/v3/api-docs/**").permitAll()
                        .anyRequest().authenticated()
                )
                // form-urlencoded: username=<email>&password=<password>
                .formLogin((form) -> form
                        .loginProcessingUrl("/auth/login")
                        .successHandler((request, response, authentication) -> {
                            UserPrinciple principal = (UserPrinciple) authentication.getPrincipal();
                            response.setStatus(HttpStatus.OK.value());
                            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                            objectMapper.writeValue(response.getWriter(), new UserResponseDto(
                                    principal.getUserId(), principal.getEmail(), principal.getName()));
                        })
                        .failureHandler((request, response, exception) -> {
                            response.setStatus(HttpStatus.UNAUTHORIZED.value());
                            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                            objectMapper.writeValue(response.getWriter(), Map.of(
                                    "status", 401,
                                    "error", "Unauthorized",
                                    "message", "Invalid email or password",
                                    "path", request.getRequestURI(),
                                    "timestamp", Instant.now().toString()));
                        })
                        .permitAll()
                )
                .logout((logout) -> logout
                        .logoutUrl("/auth/logout")
                        .logoutSuccessHandler(new HttpStatusReturningLogoutSuccessHandler(HttpStatus.NO_CONTENT))
                        .permitAll()
                )
                // return 401 instead of redirecting to a login page
                .exceptionHandling((exceptions) -> exceptions
                        .authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED))
                );

        return http.build();
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(bcryptStrength);
    }

}
