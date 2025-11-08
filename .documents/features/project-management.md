# Project Management Feature

## Overview

The iOS app allows users to save and manage their processed AI-generated images as projects. Projects are stored locally on the device in the Application Support directory.

## Architecture

### Storage Layer

**ProjectsStorageManager** (`Utilities/ProjectsStorageManager.swift`)
- Singleton pattern for shared access
- Manages project metadata and image files
- Handles duplicate prevention
- Provides migration from old storage locations

### ViewModel Layer

**ProjectsViewModel** (`ViewModels/ProjectsViewModel.swift`)
- MVVM pattern with `@Observable`
- Manages project list state
- Handles image caching
- Provides delete functionality

### View Layer

**MyProjectsView** (`Views/Projects/MyProjectsView.swift`)
- Grid view of all user projects
- Project detail view (modal)
- Delete functionality (multiple UI options)

## Storage Structure

```
Application Support/Projects/
├── projects.json                    # Project metadata (array of Project objects)
├── {projectId}.jpg                  # Processed image files
└── {projectId}-metadata.json        # Image metadata (optional)
```

## Project Model

```swift
struct Project: Identifiable, Hashable, Codable {
    let id: UUID
    let templateId: String
    let templateName: String
    let thumbnailURL: URL?
    let createdAt: Date
    let status: ProjectStatus
    
    enum ProjectStatus: String, Codable {
        case processing = "Processing"
        case completed = "Completed"
        case failed = "Failed"
    }
}
```

## Key Features

### 1. Save Project

**Flow**:
1. Image processing completes in background
2. `BackgroundImageProcessor` receives processed image
3. Creates `Project` object with metadata
4. Calls `ProjectsStorageManager.saveProject()` with `requestId`
5. Duplicate check: `requestId` or `templateId + createdAt`
6. Save project metadata to `projects.json`
7. Save processed image to `{projectId}.jpg`
8. Save image metadata (optional)
9. Mark `requestId` as saved in UserDefaults

**Duplicate Prevention**:
- Primary: Check `requestId` in saved set
- Fallback: Check `templateId + createdAt` (within 5 seconds)
- Reload from disk before checking to ensure latest data

### 2. Load Projects

**Flow**:
1. `ProjectsViewModel.loadProjects()` called
2. Calls `ProjectsStorageManager.getAllProjects()`
3. `getAllProjects()` reloads from disk (ensures latest data)
4. Decode `projects.json` file
5. Return sorted projects (newest first)
6. Preload images into cache

**Cache Management**:
- Image cache: `[String: UIImage]` keyed by `projectId`
- Preload all images on project load
- Lazy loading for images not yet cached
- Cache cleared on project deletion

### 3. Delete Project

**UI Options**:
1. **Delete Button**: X icon on top-right corner of card
2. **Context Menu**: Long press card → Delete option
3. **Detail View**: Delete button in toolbar

**Flow**:
1. User taps delete button
2. Confirmation dialog appears
3. User confirms deletion
4. `ProjectsViewModel.deleteProject()` called
5. `ProjectsStorageManager.deleteProject()` removes:
   - Project from `projects.json`
   - Image file (`{projectId}.jpg`)
   - Metadata file (`{projectId}-metadata.json`)
6. Remove from image cache
7. Reload project list
8. Haptic feedback

**Error Handling**:
- Try-catch around deletion
- Show alert if deletion fails
- Log errors for debugging
- Preserve project if deletion fails

### 4. Background Processing

**BackgroundImageProcessor** (`Utilities/BackgroundImageProcessor.swift`)
- Uses URLSession background configuration
- Handles long-running image processing tasks
- Persists pending tasks to UserDefaults
- Restores pending tasks on app restart

**Pending Task Storage**:
```swift
struct PendingTaskInfo {
    let requestId: String
    let templateId: String
    let originalImagePath: URL
    let templateName: String
    let createdAt: Date
}
```

**Task Persistence**:
- Saved to UserDefaults: `pendingImageProcessingTasks`
- Restored on app launch
- Validated: Only restore if temp file exists
- Cleanup: Remove tasks older than 24 hours

## Migration

### From Documents to Application Support

**Automatic Migration**:
1. Check if old directory exists (`Documents/Projects/`)
2. Check if new directory has data (avoid overwriting)
3. Copy `projects.json` to new location
4. Copy all image files (`.jpg`)
5. Copy all metadata files (`-metadata.json`)
6. Apply file protection to migrated files
7. Verify migration succeeded
8. Remove old directory (only if migration succeeded)

**Safety**:
- Never remove old directory if migration fails
- Preserve old data as fallback
- Log migration steps for debugging

## File Protection

**Security**:
- File protection: `completeUntilFirstUserAuthentication`
- Files encrypted at rest until first unlock
- Applied to all project files (JSON, images, metadata)

## Error Handling

### Save Errors
- Duplicate detection: Skip save, log warning
- File write errors: Throw exception, log error
- Image encoding errors: Throw exception, log error

### Load Errors
- File not found: Return empty array
- Decode errors: Log warning, preserve existing cache
- Image load errors: Return nil, show placeholder

### Delete Errors
- File not found: Log warning, continue
- Delete errors: Throw exception, show alert
- Preserve project if deletion fails

## Performance Considerations

### Image Caching
- In-memory cache: `[String: UIImage]`
- Preload all images on project load
- Lazy loading for uncached images
- Cache cleared on deletion

### Disk I/O
- Synchronous operations (local storage is fast)
- Reload from disk on every `getAllProjects()` call
- Ensures data consistency across app restarts

### Memory Management
- Image cache limited to loaded projects
- Cache cleared when projects reloaded
- Old request IDs cleaned up (>1000 entries)

## Testing

### Unit Tests
- `ProjectsStorageManager`: Save, load, delete operations
- `ProjectsViewModel`: State management, error handling
- Duplicate prevention logic
- Migration logic

### Integration Tests
- End-to-end project creation flow
- Background processing completion
- Delete functionality
- App restart scenarios

## Future Enhancements

- [ ] Project search and filter
- [ ] Project sharing (export images)
- [ ] Project organization (folders, tags)
- [ ] Cloud sync (iCloud, backend)
- [ ] Project versioning
- [ ] Batch operations (multi-select delete)
- [ ] Project analytics (usage stats)

## References

- `.documents/platform-guides/ios.md` - iOS app architecture
- `.documents/features/image-processing.md` - Image processing flow
- `AIPhotoApp/Utilities/ProjectsStorageManager.swift` - Storage implementation
- `AIPhotoApp/ViewModels/ProjectsViewModel.swift` - ViewModel implementation
- `AIPhotoApp/Views/Projects/MyProjectsView.swift` - UI implementation

