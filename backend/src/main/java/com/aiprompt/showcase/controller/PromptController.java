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
@CrossOrigin(origins = {
    "http://localhost:3000", 
    "https://scaling-spork-w54jg4p5jvvcgjj7-3000.app.github.dev",
    "https://scaling-spork-w54jg4p5jvvcgjj7-8080.app.github.dev"
}) // Allow frontend to connect
public class PromptController {

    @Autowired
    private PromptRepository promptRepository;

    // GET all approved prompts, with advanced filtering and sorting
    @GetMapping
    public List<Prompt> getAllPrompts(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String tag,
            @RequestParam(required = false) String nsfw,
            @RequestParam(required = false) String contributor,
            @RequestParam(required = false) String sort) {
        List<Prompt> prompts = promptRepository.findByIsApprovedTrue();
        // Filter by category
        if (category != null && !category.isEmpty()) {
            prompts = prompts.stream().filter(p -> p.getCategories() != null && p.getCategories().toLowerCase().contains(category.toLowerCase())).toList();
        }
        // Filter by tag
        if (tag != null && !tag.isEmpty()) {
            prompts = prompts.stream().filter(p -> p.getTags() != null && p.getTags().toLowerCase().contains(tag.toLowerCase())).toList();
        }
        // Filter by NSFW
        if (nsfw != null && !nsfw.isEmpty()) {
            if (nsfw.equals("true")) prompts = prompts.stream().filter(p -> Boolean.TRUE.equals(p.getIsNsfw())).toList();
            else if (nsfw.equals("false")) prompts = prompts.stream().filter(p -> !Boolean.TRUE.equals(p.getIsNsfw())).toList();
        }
        // Filter by contributor (username or uploaderName)
        if (contributor != null && !contributor.isEmpty()) {
            prompts = prompts.stream().filter(p ->
                (p.getUploader() != null && p.getUploader().getUsername() != null && p.getUploader().getUsername().equalsIgnoreCase(contributor)) ||
                (p.getUploaderName() != null && p.getUploaderName().equalsIgnoreCase(contributor))
            ).toList();
        }
        // Sort
        if (sort != null && sort.equals("popularity")) {
            prompts = prompts.stream().sorted((a, b) -> Integer.compare((b.getUpvoteCount() != null ? b.getUpvoteCount() : 0), (a.getUpvoteCount() != null ? a.getUpvoteCount() : 0))).toList();
        } else {
            // Default: sort by date descending
            prompts = prompts.stream().sorted((a, b) -> {
                if (a.getCreatedAt() == null || b.getCreatedAt() == null) return 0;
                return b.getCreatedAt().compareTo(a.getCreatedAt());
            }).toList();
        }
        return prompts;
    }

    // GET all prompts pending moderation
    @GetMapping("/pending")
    public List<Prompt> getPendingPrompts() {
        return promptRepository.findByIsApprovedFalse();
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
    @Autowired
private WebSocketController webSocketController;

    // Approve a prompt
    @PutMapping("/{id}/approve")
    public ResponseEntity<Prompt> approvePrompt(@PathVariable Long id) {
        Optional<Prompt> promptOpt = promptRepository.findById(id);
        if (promptOpt.isPresent()) {
            Prompt prompt = promptOpt.get();
            prompt.setIsApproved(true);
            Prompt savedPrompt = promptRepository.save(prompt);
            webSocketController.notifyNewPrompt(savedPrompt);
            return ResponseEntity.ok(savedPrompt);
        }
        return ResponseEntity.notFound().build();
    }

    // Reject (delete) a prompt
    @DeleteMapping("/{id}/reject")
    public ResponseEntity<Void> rejectPrompt(@PathVariable Long id) {
        if (promptRepository.existsById(id)) {
            promptRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    // Mark prompt as NSFW
    @PutMapping("/{id}/nsfw")
    public ResponseEntity<Prompt> markNsfw(@PathVariable Long id, @RequestParam boolean nsfw) {
        Optional<Prompt> promptOpt = promptRepository.findById(id);
        if (promptOpt.isPresent()) {
            Prompt prompt = promptOpt.get();
            prompt.setIsNsfw(nsfw);
            Prompt savedPrompt = promptRepository.save(prompt);
            return ResponseEntity.ok(savedPrompt);
        }
        return ResponseEntity.notFound().build();
    }

    // Mark prompt as low quality
    @PutMapping("/{id}/lowquality")
    public ResponseEntity<Prompt> markLowQuality(@PathVariable Long id, @RequestParam boolean lowQuality) {
        Optional<Prompt> promptOpt = promptRepository.findById(id);
        if (promptOpt.isPresent()) {
            Prompt prompt = promptOpt.get();
            prompt.setIsLowQuality(lowQuality);
            Prompt savedPrompt = promptRepository.save(prompt);
            return ResponseEntity.ok(savedPrompt);
        }
        return ResponseEntity.notFound().build();
    }
}