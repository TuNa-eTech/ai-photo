//
//  ProfileEditView.swift
//  AIPhotoApp
//
//  Modal sheet for editing user profile with form validation
//  Designed with beige + liquid glass minimalist aesthetic
//

import SwiftUI

struct ProfileEditView: View {
    @Environment(AuthViewModel.self) private var model
    
    @Environment(\.dismiss) private var dismiss
    @FocusState private var focusedField: Field?
    
    // Local state for editing
    @State private var editName: String = ""
    @State private var isSaving: Bool = false
    @State private var errorMessage: String?
    
    enum Field {
        case name
    }
    
    var body: some View {
        NavigationStack {
            ZStack {
                GlassBackgroundView()
                
                ScrollView(showsIndicators: false) {
                    VStack(spacing: 24) {
                        // Avatar Section (read-only display)
                        avatarSection
                        
                        // Edit Form (name only)
                        formSection
                        
                        // Error Message
                        if let error = errorMessage {
                            errorBanner(error)
                        }
                    }
                    .padding(.horizontal, 16)
                    .padding(.top, 24)
                    .padding(.bottom, 40)
                }
            }
            .navigationTitle("Edit Profile")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        dismiss()
                    }
                    .foregroundStyle(GlassTokens.textPrimary)
                }
                
                ToolbarItem(placement: .primaryAction) {
                    Button {
                        saveProfile()
                    } label: {
                        if isSaving {
                            ProgressView()
                                .tint(GlassTokens.textPrimary)
                        } else {
                            Text("Save")
                                .fontWeight(.semibold)
                        }
                    }
                    .foregroundStyle(GlassTokens.textPrimary)
                    .disabled(!isFormValid || isSaving)
                }
            }
            .onAppear {
                // Initialize with current name value
                editName = model.name
            }
        }
    }
    
    // MARK: - Sections
    
    private var avatarSection: some View {
        VStack(spacing: 12) {
            // Avatar Display (read-only)
            ZStack {
                Circle()
                    .fill(
                        LinearGradient(
                            colors: [
                                GlassTokens.accent1,
                                GlassTokens.accent2
                            ],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .frame(width: 104, height: 104)
                
                Circle()
                    .fill(GlassTokens.primary1)
                    .frame(width: 100, height: 100)
                
                if let avatarURL = model.avatarURL {
                    AsyncImage(url: avatarURL) { phase in
                        switch phase {
                        case .success(let image):
                            image
                                .resizable()
                                .scaledToFill()
                                .frame(width: 100, height: 100)
                                .clipShape(Circle())
                        case .failure, .empty:
                            // Fallback to initial letter
                            Text(model.name.isEmpty ? "?" : model.name.prefix(1).uppercased())
                                .font(.system(size: 42, weight: .bold))
                                .foregroundStyle(GlassTokens.textPrimary)
                        @unknown default:
                            Text(model.name.isEmpty ? "?" : model.name.prefix(1).uppercased())
                                .font(.system(size: 42, weight: .bold))
                                .foregroundStyle(GlassTokens.textPrimary)
                        }
                    }
                } else {
                    Text(model.name.isEmpty ? "?" : model.name.prefix(1).uppercased())
                        .font(.system(size: 42, weight: .bold))
                        .foregroundStyle(GlassTokens.textPrimary)
                }
            }
            .shadow(color: GlassTokens.shadowColor, radius: 12, x: 0, y: 6)
            
            // Avatar cannot be changed - informational text
            Text("Avatar cannot be changed")
                .font(.caption)
                .foregroundStyle(GlassTokens.textSecondary)
        }
        .frame(maxWidth: .infinity)
    }
    
    private var formSection: some View {
        VStack(spacing: 0) {
            // Name Field (editable)
            FormFieldRow(
                icon: "person",
                title: "Full Name",
                placeholder: "Enter your name"
            ) {
                TextField("", text: $editName)
                    .textContentType(.name)
                    .textInputAutocapitalization(.words)
                    .autocorrectionDisabled()
                    .focused($focusedField, equals: .name)
                    .foregroundStyle(GlassTokens.textPrimary)
            }
            
            Divider()
                .padding(.leading, 56)
            
            // Email Field (read-only)
            HStack(spacing: 12) {
                // Icon
                Image(systemName: "envelope")
                    .font(.title3)
                    .foregroundStyle(GlassTokens.textSecondary)
                    .frame(width: 28, height: 28)
                
                // Field
                VStack(alignment: .leading, spacing: 4) {
                    Text("Email")
                        .font(.caption)
                        .foregroundStyle(GlassTokens.textSecondary)
                    
                    Text(model.email.isEmpty ? "No email" : model.email)
                        .font(.body)
                        .foregroundStyle(GlassTokens.textSecondary)
                }
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 14)
        }
        .glassCard()
    }
    
    private func errorBanner(_ message: String) -> some View {
        HStack(spacing: 12) {
            Image(systemName: "exclamationmark.triangle.fill")
                .foregroundStyle(.red)
            
            Text(message)
                .font(.footnote)
                .foregroundStyle(GlassTokens.textPrimary)
            
            Spacer()
        }
        .padding(12)
        .background(.ultraThinMaterial.opacity(0.9), in: RoundedRectangle(cornerRadius: 14, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 14, style: .continuous)
                .stroke(Color.red.opacity(0.3), lineWidth: 0.8)
        )
    }
    
    // MARK: - Validation
    
    private var isFormValid: Bool {
        !editName.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
    }
    
    // MARK: - Actions
    
    private func saveProfile() {
        focusedField = nil
        errorMessage = nil
        isSaving = true
        
        let trimmedName = editName.trimmingCharacters(in: .whitespacesAndNewlines)
        
        Task { @MainActor in
            do {
                // Update profile via ViewModel (only name, keep email and avatarURL from current model)
                try await model.updateProfile(
                    name: trimmedName,
                    email: model.email, // Keep current email (not editable)
                    avatarURL: model.avatarURL // Keep current avatar (not editable)
                )
                
                // Success - dismiss
                isSaving = false
                dismiss()
            } catch {
                isSaving = false
                errorMessage = "Failed to save profile. Please try again."
                print("❌ [ProfileEditView] Save error: \(error)")
            }
        }
    }
}

// MARK: - Form Field Row

struct FormFieldRow<Content: View>: View {
    let icon: String
    let title: String
    let placeholder: String
    let content: Content
    
    init(
        icon: String,
        title: String,
        placeholder: String,
        @ViewBuilder content: () -> Content
    ) {
        self.icon = icon
        self.title = title
        self.placeholder = placeholder
        self.content = content()
    }
    
    var body: some View {
        HStack(spacing: 12) {
            // Icon
            Image(systemName: icon)
                .font(.title3)
                .foregroundStyle(GlassTokens.textSecondary)
                .frame(width: 28, height: 28)
            
            // Field
            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.caption)
                    .foregroundStyle(GlassTokens.textSecondary)
                
                content
                    .font(.body)
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 14)
    }
}

// MARK: - Preview

#Preview("Profile Edit") {
    let authViewModel = AuthViewModel(
        authService: AuthService(),
        userRepository: UserRepository()
    )
    return ProfileEditView()
        .environment(authViewModel)
}

