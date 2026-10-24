package com.order_platform.e_commerce_core.identity.internal;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

public class UserPrinciple implements UserDetails {

    private final User user;

    public UserPrinciple(User user){
        super();
        this.user = user;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        String userRole = user.getRole();
        return Collections.singleton(new SimpleGrantedAuthority(userRole));
    }

    public Long getUserId(){
        return user.getId();
    }

    public String getEmail(){
        return user.getEmail();
    }

    public String getName(){
        return user.getName();
    }

    @Override
    public String getPassword() {
        return user.getPassword();
    }

    @Override
    public String getUsername() {
        // Login identifier is the email (formLogin's "username" field)
        return user.getEmail();
    }

}
