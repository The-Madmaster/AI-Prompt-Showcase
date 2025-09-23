package com.aiprompt.showcase.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {

    @GetMapping("/api/prompts/health")
    public String health() {
        return "🚀 AI Prompt Showcase API is running!";
    }
    
    @GetMapping("/")
    public String home() {
        return "AI Prompt Showcase Backend is running! Visit /api/prompts for the API.";
    }
}