//
//  ProfileEditView.swift
//  AIPhotoApp
//
//  Modal sheet for editing user profile with form validation
//  Designed with beige + liquid glass minimalist aesthetic
//

import SwiftUI

struct ProfileEditView: View {
    let model: AuthViewModel
    
    @Environment(\.dismiss) private var dismiss
    @FocusState private var focusedField: Field?
    
    // Local state for editing
    @State private var editName: String = ""
    @State private var editEmail: String = ""
    @State private var isSaving: Bool = false
    @State private var errorMessage: String?
    
    enum Field {
        case name, email
    }
    
    var body: some View {
        NavigationStack {
            ZStack {
                GlassBackgroundView()
                
                ScrollView(showsIndicators: false) {
                    VStack(spacing: 24) {
                        // Avatar Section
                        avatarSection
                        
                        // Edit Form
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
                // Initialize with current values
                editName = model.name
                editEmail = model.email
            }
        }
    }
    
    // MARK: - Sections
    
    private var avatarSection: some View {
        VStack(spacing: 12) {
            // Avatar Display
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
                
                if let avatarURL = model.avatarURL?.absoluteString, !avatarURL.isEmpty {
                    // TODO: AsyncImage when backend provides URLs
                    Image(systemName: "person.fill")
                        .font(.system(size: 42))
                        .foregroundStyle(GlassTokens.textPrimary)
                } else {
                    Text(editName.isEmpty ? "?" : editName.prefix(1).uppercased())
                        .font(.system(size: 42, weight: .bold))
                        .foregroundStyle(GlassTokens.textPrimary)
                }
                
                // Edit badge
                Circle()
                    .fill(.ultraThinMaterial.opacity(0.9))
                    .frame(width: 32, height: 32)
                    .overlay(
                        Image(systemName: "camera.fill")
                            .font(.caption)
                            .foregroundStyle(GlassTokens.textPrimary)
                    )
                    .overlay(
                        Circle()
                            .stroke(GlassTokens.borderColor.opacity(0.3), lineWidth: 0.8)
                    )
                    .offset(x: 35, y: 35)
            }
            .shadow(color: GlassTokens.shadowColor, radius: 12, x: 0, y: 6)
            
            Button {
                // TODO: Photo picker
                print("Change photo tapped")
            } label: {
                Text("Change Photo")
                    .font(.subheadline.weight(.medium))
                    .foregroundStyle(GlassTokens.textPrimary)
                    .padding(.horizontal, 16)
                    .padding(.vertical, 8)
                    .background(.ultraThinMaterial.opacity(0.8), in: Capsule())
                    .overlay(Capsule().stroke(GlassTokens.borderColor.opacity(0.3), lineWidth: 0.8))
            }
        }
        .frame(maxWidth: .infinity)
    }
    
    private var formSection: some View {
        VStack(spacing: 0) {
            // Name Field
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
            
            // Email Field
            FormFieldRow(
                icon: "envelope",
                title: "Email",
                placeholder: "Enter your email"
            ) {
                TextField("", text: $editEmail)
                    .textContentType(.emailAddress)
                    .textInputAutocapitalization(.never)
                    .keyboardType(.emailAddress)
                    .autocorrectionDisabled()
                    .focused($focusedField, equals: .email)
                    .foregroundStyle(GlassTokens.textPrimary)
            }
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
        let nameOK = !editName.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
        let emailOK = isValidEmail(editEmail)
        return nameOK && emailOK
    }
    
    private func isValidEmail(_ email: String) -> Bool {
        let pattern = #"^[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$"#
        return email.range(of: pattern, options: .regularExpression) != nil
    }
    
    // MARK: - Actions
    
    private func saveProfile() {
        focusedField = nil
        errorMessage = nil
        isSaving = true
        
        // Update model
        model.name = editName.trimmingCharacters(in: .whitespacesAndNewlines)
        model.email = editEmail.trimmingCharacters(in: .whitespacesAndNewlines)
        
        // TODO: Call backend API to update profile
        Task { @MainActor in
            do {
                // Simulate API call
                try await Task.sleep(for: .seconds(1))
                
                // Success - dismiss
                isSaving = false
                dismiss()
            } catch {
                isSaving = false
                errorMessage = "Failed to save profile. Please try again."
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
    ProfileEditView(
        model: AuthViewModel(
            authService: AuthService(),
            userRepository: UserRepository()
        )
    )
}

