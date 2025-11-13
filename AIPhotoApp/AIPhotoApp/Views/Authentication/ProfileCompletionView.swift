//  ProfileCompletionView.swift
//  AIPhotoApp
//
//  Collects missing profile info (name, email) after social sign-in,
//  then calls /v1/users/register via AuthViewModel.

import SwiftUI

struct ProfileCompletionView: View {
    let model: AuthViewModel
    @FocusState private var focusedField: Field?

    enum Field {
        case name, email
    }

    var body: some View {
        NavigationStack {
            Form {
                Section(header: Text(NSLocalizedString("l10n.profile.section.title", comment: "Profile section header"))) {
                    TextField(NSLocalizedString("l10n.profile.name.placeholder", comment: "Full name"), text: Binding(
                        get: { model.name },
                        set: { model.name = $0 }
                    ))
                    .textContentType(.name)
                    .textInputAutocapitalization(.words)
                    .autocorrectionDisabled()
                    .focused($focusedField, equals: .name)

                    TextField(NSLocalizedString("l10n.profile.email.placeholder", comment: "Email"), text: Binding(
                        get: { model.email },
                        set: { model.email = $0 }
                    ))
                    .textContentType(.emailAddress)
                    .textInputAutocapitalization(.never)
                    .keyboardType(.emailAddress)
                    .autocorrectionDisabled()
                    .focused($focusedField, equals: .email)

                    if let avatarURL = model.avatarURL {
                        HStack {
                            Text(NSLocalizedString("l10n.profile.avatar", comment: "Avatar"))
                            Spacer()
                            Text(avatarURL.absoluteString)
                                .font(.footnote)
                                .foregroundStyle(.secondary)
                                .lineLimit(1)
                                .truncationMode(.middle)
                        }
                        .accessibilityLabel(NSLocalizedString("l10n.profile.avatar", comment: "Avatar"))
                    }
                }

                if let error = model.errorMessage, !error.isEmpty {
                    Section {
                        Text(error)
                            .font(.footnote)
                            .foregroundStyle(.white)
                            .padding(12)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .background(
                                RoundedRectangle(cornerRadius: 8)
                                    .fill(Color.red.opacity(0.9))
                            )
                            .listRowInsets(EdgeInsets())
                            .accessibilityLabel(NSLocalizedString("l10n.profile.error.label", comment: "Error message"))
                            .accessibilityHint(error)
                    }
                }

                Section {
                    Button {
                        focusedField = nil
                        model.submitProfile()
                    } label: {
                        if model.isLoading {
                            ProgressView()
                                .frame(maxWidth: .infinity)
                        } else {
                            Text(NSLocalizedString("l10n.profile.action.continue", comment: "Continue"))
                                .frame(maxWidth: .infinity)
                        }
                    }
                    .disabled(!isFormValid || model.isLoading)
                    .accessibilityLabel(NSLocalizedString("l10n.profile.submit.accessibility", comment: "Submit profile"))
                } footer: {
                    Text(NSLocalizedString("l10n.profile.footer", comment: "Profile footer"))
                }
            }
            .navigationTitle(NSLocalizedString("l10n.profile.title", comment: "Complete Profile"))
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button(NSLocalizedString("l10n.common.close", comment: "Close")) {
                        model.requiresProfileCompletion = false
                    }
                }
            }
        }
        .onAppear {
            // Defer focus to next runloop to avoid transient keyboard constraint conflicts
            DispatchQueue.main.async {
                if model.name.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
                    focusedField = .name
                } else if model.email.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
                    focusedField = .email
                }
            }
        }
    }

    // MARK: - Validation

    private var isFormValid: Bool {
        let nameOK = !model.name.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
        let emailOK = isValidEmail(model.email)
        return nameOK && emailOK
    }

    private func isValidEmail(_ email: String) -> Bool {
        let pattern = #"^[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$"#
        return email.range(of: pattern, options: .regularExpression) != nil
    }
}

#Preview {
    ProfileCompletionView(model: AuthViewModel(authService: AuthService(), userRepository: UserRepository()))
}
