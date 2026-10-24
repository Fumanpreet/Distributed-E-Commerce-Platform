package com.order_platform.e_commerce_core.identity;

import com.order_platform.e_commerce_core.identity.dto.RegisterRequestDto;
import com.order_platform.e_commerce_core.identity.dto.RegisterResponseDto;
import com.order_platform.e_commerce_core.identity.internal.User;
import com.order_platform.e_commerce_core.identity.internal.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public RegisterResponseDto register(RegisterRequestDto request) throws IllegalArgumentException{

        String email = request.email().trim().toLowerCase();

        // if user exists by querying the database
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("User with this email already exists");
        }

        User user = new User(request, passwordEncoder);
        // Save the user in database
        User savedUser = userRepository.save(user);

        return RegisterResponseDto.fromEntity(savedUser);
    }
}

