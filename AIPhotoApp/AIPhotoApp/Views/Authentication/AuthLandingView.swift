//  AuthLandingView.swift
//  AIPhotoApp
//
//  Landing screen for Authentication (Apple / Google), handles loading + error,
//  presents ProfileCompletion when needed, and navigates to Home/Templates on success.

import SwiftUI
import AuthenticationServices

struct AuthLandingView: View {
    let model: AuthViewModel

    var body: some View {
        NavigationStack {
            ZStack {
                ScrollView {
                    VStack(spacing: 24) {
                        // Hero / Value proposition
                        VStack(spacing: 8) {
                            Text("Biến ảnh thành phong cách AI")
                                .font(.largeTitle.bold())
                                .multilineTextAlignment(.center)
                            Text("Chỉ vài chạm để tạo ra bức ảnh độc đáo theo phong cách bạn yêu thích.")
                                .font(.body)
                                .foregroundStyle(.secondary)
                                .multilineTextAlignment(.center)
                        }
                        .padding(.top, 48)

                        // Sign in with Apple
                        SignInWithAppleButton(
                            .signIn,
                            onRequest: { request in
                                model.configureAppleRequest(request)
                            },
                            onCompletion: { result in
                                model.handleAppleCompletion(result)
                            }
                        )
                        .signInWithAppleButtonStyle(.black)
                        .frame(height: 52)
                        .clipShape(RoundedRectangle(cornerRadius: 12))

                        // Sign in with Google (brand-safe simple SwiftUI button)
                        Button {
                            model.signInWithGoogle()
                        } label: {
                            HStack(spacing: 12) {
                                // Simple "G" placeholder; consider replacing with official logo asset if available
                                ZStack {
                                    Circle()
                                        .fill(Color.white)
                                        .frame(width: 22, height: 22)
                                    Text("G")
                                        .font(.headline.bold())
                                        .foregroundStyle(.red)
                                }
                                Text("Tiếp tục với Google")
                                    .font(.headline)
                            }
                            .frame(maxWidth: .infinity, minHeight: 52)
                        }
                        .buttonStyle(.bordered)
                        .buttonBorderShape(.roundedRectangle(radius: 12))
                        .tint(.gray)

                        // Terms & Privacy
                        VStack(spacing: 4) {
                            Text("Bằng việc tiếp tục, bạn đồng ý với")
                                .font(.footnote)
                                .foregroundStyle(.secondary)
                            HStack(spacing: 16) {
                                Link("Điều khoản", destination: URL(string: "https://example.com/terms")!)
                                    .font(.footnote)
                                Link("Chính sách bảo mật", destination: URL(string: "https://example.com/privacy")!)
                                    .font(.footnote)
                            }
                        }
                        .padding(.top, 8)

                        // Error banner (non-blocking)
                        if let error = model.errorMessage, !error.isEmpty {
                            Text(error)
                                .font(.footnote)
                                .foregroundStyle(.white)
                                .padding(12)
                                .frame(maxWidth: .infinity, alignment: .leading)
                                .background(
                                    RoundedRectangle(cornerRadius: 10)
                                        .fill(Color.red.opacity(0.9))
                                )
                                .padding(.top, 8)
                                .accessibilityLabel("Thông báo lỗi")
                                .accessibilityHint(error)
                        }
                    }
                    .padding(.horizontal, 20)
                    .padding(.bottom, 40)
                }

                // Loading overlay
                if model.isLoading {
                    Color.black.opacity(0.2)
                        .ignoresSafeArea()
                    ProgressView("Đang xử lý...")
                        .padding(16)
                        .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 12))
                        .accessibilityLabel("Đang xử lý")
                }
            }
            .navigationBarHidden(true)
        }
        
        
    }
}

 // MARK: - Placeholder home screen after authentication
struct TemplatesHomeView: View {
    let model: AuthViewModel

    var body: some View {
        NavigationStack {
            VStack(spacing: 16) {
                Text("Chào mừng đến AIPhotoApp!")
                    .font(.title2.bold())
                Text("Bạn đã đăng nhập thành công.")
                    .foregroundStyle(.secondary)

                Button(role: .destructive) {
                    model.logout()
                } label: {
                    Text("Đăng xuất")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.borderedProminent)
                .tint(.red)
                .padding(.top, 24)
            }
            .padding()
            .navigationTitle("Templates")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Đăng xuất") {
                        model.logout()
                    }
                }
            }
        }
    }
}

#Preview {
    AuthLandingView(model: AuthViewModel(authService: AuthService(), userRepository: UserRepository()))
}
