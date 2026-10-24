package com.order_platform.e_commerce_core.identity.internal;

import com.order_platform.e_commerce_core.identity.dto.RegisterRequestDto;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "user_identity")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(length = 30, nullable = false)
    private String name;

    @Column(nullable = false)
    private String role;

    @Column(nullable = false)
    private Integer enabled;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void prePersist() {
        if (role == null) {
            role = "USER";
        }

        if (enabled == null) {
            enabled = 1;
        }

        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    public User(RegisterRequestDto request, PasswordEncoder passwordEncoder){
        this.email = request.email().trim().toLowerCase();
        // password gets BCrypt hashed
        this.password = passwordEncoder.encode(request.password());
        this.name = request.name();
    }

}
