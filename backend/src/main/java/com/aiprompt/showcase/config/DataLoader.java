package com.aiprompt.showcase.config;

import com.aiprompt.showcase.model.Prompt;
import com.aiprompt.showcase.repository.PromptRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class DataLoader implements CommandLineRunner {

    @Autowired
    private PromptRepository promptRepository;

    @Override
    public void run(String... args) throws Exception {
        // Add some sample prompts if the database is empty
        if (promptRepository.count() == 0) {
            Prompt prompt1 = new Prompt(
                "Convert this image into a cinematic portrait against a backdrop of mountains at sunset. Keep the face intact and use soft lighting to create a vintage movie still vibe.",
                "https://example.com/source1"
            );
            prompt1.setModel("Google Gemini");
            prompt1.setCredit("NDTV Profit");
            prompt1.setLicense("CC-BY-4.0");
            prompt1.setIsApproved(true);
            
            Prompt prompt2 = new Prompt(
                "Create a minimalist logo for a coffee shop called 'Bean There' using only black and white colors with a simple coffee cup icon.",
                "https://example.com/source2"
            );
            prompt2.setModel("DALL-E 3");
            prompt2.setCredit("Design Weekly");
            prompt2.setLicense("All rights reserved");
            prompt2.setIsApproved(true);

            promptRepository.save(prompt1);
            promptRepository.save(prompt2);
            
            System.out.println("✅ Sample prompts added to database!");
        }
    }
}