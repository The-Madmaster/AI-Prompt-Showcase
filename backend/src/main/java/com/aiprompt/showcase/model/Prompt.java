package com.aiprompt.showcase.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "prompts")
public class Prompt {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 1000)
    private String promptText;

    private String inputMediaUrl;
    private String outputMediaUrl;
    private String model;
    
    @Column(nullable = false)
    private String sourceUrl;
    
    private String credit;
    private String license;
    private String uploaderName;
    private String uploaderEmail;
    
    private Boolean isApproved = false;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private String inputImageUrl;    // Cloudinary URL for input image
private String outputImageUrl;   // Cloudinary URL for output image
private String inputImagePublicId;  // Cloudinary public ID for deletion
private String outputImagePublicId; // Cloudinary public ID for deletion

    // Default constructor (required by JPA)
    public Prompt() {}

    // Constructor for easy creation
    public Prompt(String promptText, String sourceUrl) {
        this.promptText = promptText;
        this.sourceUrl = sourceUrl;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getPromptText() { return promptText; }
    public void setPromptText(String promptText) { this.promptText = promptText; }

    public String getInputMediaUrl() { return inputMediaUrl; }
    public void setInputMediaUrl(String inputMediaUrl) { this.inputMediaUrl = inputMediaUrl; }

    public String getOutputMediaUrl() { return outputMediaUrl; }
    public void setOutputMediaUrl(String outputMediaUrl) { this.outputMediaUrl = outputMediaUrl; }

    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }

    public String getSourceUrl() { return sourceUrl; }
    public void setSourceUrl(String sourceUrl) { this.sourceUrl = sourceUrl; }

    public String getCredit() { return credit; }
    public void setCredit(String credit) { this.credit = credit; }

    public String getLicense() { return license; }
    public void setLicense(String license) { this.license = license; }

    public String getUploaderName() { return uploaderName; }
    public void setUploaderName(String uploaderName) { this.uploaderName = uploaderName; }

    public String getUploaderEmail() { return uploaderEmail; }
    public void setUploaderEmail(String uploaderEmail) { this.uploaderEmail = uploaderEmail; }

    public Boolean getIsApproved() { return isApproved; }
    public void setIsApproved(Boolean isApproved) { this.isApproved = isApproved; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}