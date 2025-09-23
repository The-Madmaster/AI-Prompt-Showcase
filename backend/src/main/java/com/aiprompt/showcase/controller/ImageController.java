package com.aiprompt.showcase.controller;

import com.aiprompt.showcase.service.CloudinaryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/images")
@CrossOrigin(origins = {"https://the-madmaster.github.io", "http://localhost:3000"})
public class ImageController {

    @Autowired
    private CloudinaryService cloudinaryService;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadImage(@RequestParam("image") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("Please select an image to upload");
            }
            
            String imageUrl = cloudinaryService.uploadImage(file);
            return ResponseEntity.ok().body("{\"url\": \"" + imageUrl + "\"}");
            
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error uploading image: " + e.getMessage());
        }
    }
}