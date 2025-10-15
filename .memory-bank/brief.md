# Project Brief

_This file defines the core requirements and goals for the project. It is the foundation for all other memory bank files. Please update this file manually if the project scope or requirements change._

**Project Name:** ImageAIWraper

**Core Requirements:**
- **Purpose:** To create an iOS application that allows users to apply AI-powered styles to their photos.
- **Features:**
    - Browse a list of available AI style templates.
    - Upload a photo from the user's device.
    - Apply the selected AI style to the uploaded photo.
    - View the generated image.
    - Save the generated image to the user's device.
- **Constraints:**
    - The application must be a native iOS app written in SwiftUI.
    - The backend must be a self-hosted Supabase instance.
    - AI processing should be handled by a Supabase Edge Function.
    - Secret keys and prompts must be stored securely on the backend.