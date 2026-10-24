package com.order_platform.e_commerce_core.identity.internal;

import com.order_platform.e_commerce_core.identity.AuthService;
import com.order_platform.e_commerce_core.identity.dto.RegisterRequestDto;
import com.order_platform.e_commerce_core.identity.dto.RegisterResponseDto;
import com.order_platform.e_commerce_core.identity.dto.UserResponseDto;
import io.swagger.v3.oas.annotations.Parameter;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/auth/register")
    public ResponseEntity<RegisterResponseDto> register(@Valid @RequestBody RegisterRequestDto request) {

        RegisterResponseDto response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // Login (POST /auth/login) and logout (POST /auth/logout) are handled by Spring Security, see WebSecurityConfig

    // Lets the frontend restore the logged-in user from the session cookie on page load
    @GetMapping("/auth/me")
    public ResponseEntity<UserResponseDto> me(
            @Parameter(hidden = true) @AuthenticationPrincipal UserPrinciple principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        return ResponseEntity.ok(toDto(principal));
    }

    @GetMapping("/")
    public String securedEndpoint() {
        return "Welcome to the secured landing page!";
    }

    static UserResponseDto toDto(UserPrinciple principal) {
        return new UserResponseDto(principal.getUserId(), principal.getEmail(), principal.getName());
    }
}
