package com.aiprompt.showcase.controller;

import com.aiprompt.showcase.model.Prompt;
import com.aiprompt.showcase.repository.PromptRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/prompts")
@CrossOrigin(origins = "*") // Allow frontend to connect
public class PromptController {

    @Autowired
    private PromptRepository promptRepository;

    // GET all approved prompts
    @GetMapping
    public List<Prompt> getAllPrompts() {
        return promptRepository.findByIsApprovedTrue();
    }

    // GET a specific prompt by ID
    @GetMapping("/{id}")
    public ResponseEntity<Prompt> getPromptById(@PathVariable Long id) {
        Optional<Prompt> prompt = promptRepository.findById(id);
        return prompt.map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
    }

    // POST a new prompt (for contributions)
    @PostMapping
    public Prompt createPrompt(@RequestBody Prompt prompt) {
        // Set default values
        if (prompt.getIsApproved() == null) {
            prompt.setIsApproved(false); // All new submissions need moderation
        }
        return promptRepository.save(prompt);
    }

    // Simple health check endpoint
    @GetMapping("/health")
    public String healthCheck() {
        return "🚀 AI Prompt Showcase API is running!";
    }
}