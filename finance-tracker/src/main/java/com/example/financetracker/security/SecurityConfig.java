package com.example.financetracker.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;

import org.springframework.security.config.annotation.web.builders.HttpSecurity;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfig {

    /* =========================================================
       PASSWORD ENCODER
    ========================================================= */

    @Bean
    public PasswordEncoder passwordEncoder() {

        return new BCryptPasswordEncoder();
    }


    /* =========================================================
       AUTHENTICATION MANAGER
    ========================================================= */

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration
    ) throws Exception {

        return configuration.getAuthenticationManager();
    }


    /* =========================================================
       SECURITY CONTEXT REPOSITORY
    ========================================================= */

    @Bean
    public SecurityContextRepository securityContextRepository() {

        return new HttpSessionSecurityContextRepository();
    }


    /* =========================================================
       CORS CONFIGURATION
    ========================================================= */

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration =
                new CorsConfiguration();

        configuration.setAllowedOriginPatterns(
                List.of(
                        "https://financetracker-production-3fe4.up.railway.app",
                        "http://localhost:5500",
                        "http://127.0.0.1:5500"
                )
        );

        configuration.setAllowedMethods(
                List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "DELETE",
                        "PATCH",
                        "OPTIONS"
                )
        );

        configuration.setAllowedHeaders(
                List.of("*")
        );

        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/**",
                configuration
        );

        return source;
    }


    /* =========================================================
       SECURITY FILTER CHAIN
    ========================================================= */

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            SecurityContextRepository securityContextRepository
    ) throws Exception {

        http

                /* ---------------------------------------------
                   CORS
                --------------------------------------------- */

                .cors(
                        cors -> cors
                                .configurationSource(
                                        corsConfigurationSource()
                                )
                )


                /* ---------------------------------------------
                   CSRF
                --------------------------------------------- */

                .csrf(
                        csrf -> csrf.disable()
                )


                /* ---------------------------------------------
                   SECURITY CONTEXT
                --------------------------------------------- */

                .securityContext(
                        securityContext ->
                                securityContext
                                        .securityContextRepository(
                                                securityContextRepository
                                        )
                                        .requireExplicitSave(true)
                )


                /* ---------------------------------------------
                   SESSION MANAGEMENT
                --------------------------------------------- */

                .sessionManagement(
                        session -> session
                                .sessionFixation(
                                        sessionFixation ->
                                                sessionFixation
                                                        .migrateSession()
                                )
                )


                /* ---------------------------------------------
                   AUTHORIZATION
                --------------------------------------------- */

                .authorizeHttpRequests(
                        authorization -> authorization

                                /* =================================
                                   PUBLIC AUTHENTICATION API
                                ================================= */

                                .requestMatchers(
                                        "/api/auth/**"
                                )
                                .permitAll()


                                /* =================================
                                   PUBLIC PWA FILES
                                ================================= */

                                .requestMatchers(
                                        "/manifest.json",
                                        "/service-worker.js",
                                        "/static/js/service-worker.js"
                                )
                                .permitAll()


                                /* =================================
                                   PUBLIC FRONTEND PAGES
                                ================================= */

                                .requestMatchers(
                                        "/",
                                        "/index.html",
                                        "/login.html",
                                        "/register.html",
                                        "/forgot-password.html",
                                        "/accounts.html",
                                        "/transactions.html",
                                        "/budgets.html",
                                        "/savings.html",
                                        "/recurring.html",
                                        "/reports.html",
                                        "/profile.html",
                                        "/notifications.html",
                                        "/dashboard.html"
                                )
                                .permitAll()


                                /* =================================
                                   PUBLIC STATIC RESOURCES
                                ================================= */

                                .requestMatchers(
                                        "/static/**",
                                        "/css/**",
                                        "/js/**",
                                        "/images/**"
                                )
                                .permitAll()


                                /* =================================
                                   EVERYTHING ELSE REQUIRES LOGIN
                                ================================= */

                                .anyRequest()
                                .authenticated()
                )


                /* ---------------------------------------------
                   FORM LOGIN
                --------------------------------------------- */

                .formLogin(
                        form -> form.disable()
                )


                /* ---------------------------------------------
                   BASIC AUTH
                --------------------------------------------- */

                .httpBasic(
                        basic -> basic.disable()
                );


        return http.build();
    }
}
