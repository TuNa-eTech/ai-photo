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
                Section(header: Text("Thông tin cá nhân")) {
                    TextField("Họ và tên", text: Binding(
                        get: { model.name },
                        set: { model.name = $0 }
                    ))
                    .textContentType(.name)
                    .textInputAutocapitalization(.words)
                    .autocorrectionDisabled()
                    .focused($focusedField, equals: .name)

                    TextField("Email", text: Binding(
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
                            Text("Ảnh đại diện")
                            Spacer()
                            Text(avatarURL.absoluteString)
                                .font(.footnote)
                                .foregroundStyle(.secondary)
                                .lineLimit(1)
                                .truncationMode(.middle)
                        }
                        .accessibilityLabel("Ảnh đại diện")
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
                            .accessibilityLabel("Thông báo lỗi")
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
                            Text("Tiếp tục")
                                .frame(maxWidth: .infinity)
                        }
                    }
                    .disabled(!isFormValid || model.isLoading)
                    .accessibilityLabel("Gửi thông tin hồ sơ")
                } footer: {
                    Text("Tên và email là bắt buộc để hoàn tất hồ sơ.")
                }
            }
            .navigationTitle("Hoàn tất hồ sơ")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Đóng") {
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
