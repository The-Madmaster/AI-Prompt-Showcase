package com.aiprompt.showcase.repository;

import com.aiprompt.showcase.model.Prompt;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PromptRepository extends JpaRepository<Prompt, Long> {
    // This automatically gives us CRUD operations!
    List<Prompt> findByIsApprovedTrue(); // Find only approved prompts
    List<Prompt> findByIsApprovedFalse(); // Find pending moderation
}