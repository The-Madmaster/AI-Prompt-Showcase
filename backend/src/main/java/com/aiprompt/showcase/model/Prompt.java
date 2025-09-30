package com.aiprompt.showcase.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.Set;

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

    // Link to user (optional)
    @ManyToOne
    @JoinColumn(name = "uploader_id")
    private User uploader;

    // Upvotes/favorites
    @ManyToMany
    @JoinTable(
        name = "prompt_upvotes",
        joinColumns = @JoinColumn(name = "prompt_id"),
        inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private Set<User> upvotedBy;

    @ManyToMany
    @JoinTable(
        name = "prompt_favorites",
        joinColumns = @JoinColumn(name = "prompt_id"),
        inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private Set<User> favoritedBy;

    // Popularity count (denormalized for sorting)
    private Integer upvoteCount = 0;
    private Integer favoriteCount = 0;
    
    private Boolean isApproved = false;

    // Moderation fields
    private Boolean isNsfw = false;
    private Boolean isLowQuality = false;

    // Categories/tags (comma-separated for simplicity)
    private String categories;
    private String tags;
    
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
    public User getUploader() { return uploader; }
    public void setUploader(User uploader) { this.uploader = uploader; }

    public Set<User> getUpvotedBy() { return upvotedBy; }
    public void setUpvotedBy(Set<User> upvotedBy) { this.upvotedBy = upvotedBy; }

    public Set<User> getFavoritedBy() { return favoritedBy; }
    public void setFavoritedBy(Set<User> favoritedBy) { this.favoritedBy = favoritedBy; }

    public Integer getUpvoteCount() { return upvoteCount; }
    public void setUpvoteCount(Integer upvoteCount) { this.upvoteCount = upvoteCount; }

    public Integer getFavoriteCount() { return favoriteCount; }
    public void setFavoriteCount(Integer favoriteCount) { this.favoriteCount = favoriteCount; }
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

    public Boolean getIsNsfw() { return isNsfw; }
    public void setIsNsfw(Boolean isNsfw) { this.isNsfw = isNsfw; }

    public Boolean getIsLowQuality() { return isLowQuality; }
    public void setIsLowQuality(Boolean isLowQuality) { this.isLowQuality = isLowQuality; }

    public String getCategories() { return categories; }
    public void setCategories(String categories) { this.categories = categories; }

    public String getTags() { return tags; }
    public void setTags(String tags) { this.tags = tags; }

    public Boolean getIsApproved() { return isApproved; }
    public void setIsApproved(Boolean isApproved) { this.isApproved = isApproved; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}