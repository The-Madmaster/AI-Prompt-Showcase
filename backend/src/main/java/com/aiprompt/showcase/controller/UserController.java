package com.aiprompt.showcase.controller;

import com.aiprompt.showcase.model.User;
import com.aiprompt.showcase.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = {"http://localhost:3000", "https://scaling-spork-w54jg4p5jvvcgjj7-3000.app.github.dev"})
public class UserController {
    @Autowired
    private UserRepository userRepository;

    // Register
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        if (userRepository.existsByUsername(user.getUsername())) {
            return ResponseEntity.badRequest().body("Username already exists");
        }
        // NOTE: In production, hash the password!
        userRepository.save(user);
        return ResponseEntity.ok("User registered");
    }

    // Login (simple, not secure for production)
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User login) {
        Optional<User> userOpt = userRepository.findByUsername(login.getUsername());
        if (userOpt.isPresent() && userOpt.get().getPasswordHash().equals(login.getPasswordHash())) {
            return ResponseEntity.ok(userOpt.get());
        }
        return ResponseEntity.status(401).body("Invalid credentials");
    }

    // Get user profile
    @GetMapping("/{username}")
    public ResponseEntity<?> getProfile(@PathVariable String username) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        return userOpt.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }
}
