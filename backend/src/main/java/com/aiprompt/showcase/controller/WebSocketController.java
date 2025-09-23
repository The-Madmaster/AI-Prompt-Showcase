package com.aiprompt.showcase.controller;

import com.aiprompt.showcase.model.Prompt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class WebSocketController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    // Notify all clients when a new prompt is approved
    public void notifyNewPrompt(Prompt prompt) {
        messagingTemplate.convertAndSend("/topic/new-prompts", prompt);
    }

    // Notify all clients when a prompt is updated
    public void notifyPromptUpdate(Prompt prompt) {
        messagingTemplate.convertAndSend("/topic/updates", prompt);
    }

    @MessageMapping("/chat")
    @SendTo("/topic/messages")
    public String handleChatMessage(String message) {
        return "New message: " + message;
    }
}