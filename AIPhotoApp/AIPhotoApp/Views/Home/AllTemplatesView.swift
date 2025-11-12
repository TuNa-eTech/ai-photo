//
//  AllTemplatesView.swift
//  AIPhotoApp
//
//  Full templates view with pagination and load more
//

import SwiftUI

struct AllTemplatesView: View {
    @Environment(AuthViewModel.self) private var authModel
    @State private var viewModel = AllTemplatesViewModel()
    
    private let gridCols: [GridItem] = [
        GridItem(.flexible(), spacing: 12, alignment: .top),
        GridItem(.flexible(), spacing: 12, alignment: .top)
    ]
    
    var body: some View {
        NavigationStack {
            ZStack {
                GlassBackgroundView()
                
                VStack(spacing: 0) {
                    if viewModel.isLoading && viewModel.templates.isEmpty {
                        // Initial loading state
                        VStack {
                            ProgressView()
                                .tint(GlassTokens.textPrimary)
                            Text("Loading templates...")
                                .font(.subheadline)
                                .foregroundStyle(GlassTokens.textSecondary)
                                .padding(.top, 16)
                        }
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                    } else if viewModel.templates.isEmpty {
                        // Empty state
                        emptyStateView
                    } else {
                        // Templates grid with load more
                        ScrollView(showsIndicators: false) {
                            VStack(spacing: 12) {
                                LazyVGrid(columns: gridCols, spacing: 12) {
                                    ForEach(viewModel.templates) { item in
                                        CardGlassSmall(
                                            title: item.title,
                                            tag: item.tag,
                                            thumbnailURL: item.thumbnailURL,
                                            thumbnailSymbol: item.thumbnailSymbol ?? "photo"
                                        )
                                        .overlay(alignment: .topTrailing) {
                                            if viewModel.isFavorite(item) {
                                                GlassChip(text: "Fav", systemImage: "heart.fill")
                                                    .padding(8)
                                            }
                                        }
                                        .onTapGesture {
                                            UIImpactFeedbackGenerator(style: .light).impactOccurred()
                                            // Navigate to template selection if needed
                                        }
                                        .contextMenu {
                                            Button("Preview", systemImage: "eye") {}
                                            Button(viewModel.isFavorite(item) ? "Remove Favorite" : "Add Favorite",
                                                   systemImage: viewModel.isFavorite(item) ? "heart.slash" : "heart") {
                                                viewModel.toggleFavorite(item)
                                            }
                                        }
                                    }
                                }
                                
                                // Load more trigger
                                if viewModel.hasMorePages && !viewModel.isLoadingMore {
                                    Button(action: loadMore) {
                                        VStack(spacing: 8) {
                                            Image(systemName: "arrow.down.circle")
                                                .font(.title3)
                                                .foregroundStyle(GlassTokens.accent1)
                                            Text("Load More")
                                                .font(.caption)
                                                .foregroundStyle(GlassTokens.textSecondary)
                                        }
                                        .frame(maxWidth: .infinity)
                                        .padding(.vertical, 24)
                                    }
                                    .buttonStyle(.plain)
                                } else if viewModel.isLoadingMore {
                                    VStack(spacing: 8) {
                                        ProgressView()
                                            .tint(GlassTokens.textPrimary)
                                        Text("Loading...")
                                            .font(.caption)
                                            .foregroundStyle(GlassTokens.textSecondary)
                                    }
                                    .frame(maxWidth: .infinity)
                                    .padding(.vertical, 24)
                                }
                            }
                            .padding(.horizontal, 16)
                            .padding(.vertical, 12)
                        }
                    }
                }
            }
            .navigationTitle("All Templates")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar(.hidden, for: .tabBar)
        }
        .onAppear {
            if viewModel.templates.isEmpty {
                loadInitial()
            }
        }
    }
    
    private var emptyStateView: some View {
        VStack(spacing: 16) {
            Image(systemName: "sparkles")
                .font(.system(size: 48))
                .foregroundStyle(GlassTokens.textSecondary.opacity(0.6))
            
            Text("No Templates Found")
                .font(.headline)
                .foregroundStyle(GlassTokens.textPrimary)
            
            if let error = viewModel.errorMessage {
                Text(error)
                    .font(.caption)
                    .foregroundStyle(.red)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 20)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
    
    private func loadInitial() {
        guard let token = authModel.loadToken() else { return }
        
        viewModel.loadInitial(
            bearerIDToken: token,
            tokenProvider: { try await authModel.fetchFreshIDToken() }
        )
    }
    
    private func loadMore() {
        guard let token = authModel.loadToken() else { return }
        
        viewModel.loadMore(
            bearerIDToken: token,
            tokenProvider: { try await authModel.fetchFreshIDToken() }
        )
    }
}

// MARK: - Preview

#Preview {
    AllTemplatesView()
        .environment(AuthViewModel(authService: AuthService(), userRepository: UserRepository()))
}
