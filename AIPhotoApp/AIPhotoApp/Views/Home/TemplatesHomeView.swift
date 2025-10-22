//
//  TemplatesHomeView.swift
//  AIPhotoApp
//
//  Home screen implementing "Liquid Glass" (glassmorphism) per UI spec.
//  Sections: Header, Search + Filters, Featured Carousel, Template Grid, Recent Results (optional), FAB Create.
//  Includes Debug Overlay (DEBUG only) hidden behind triple-tap on avatar.
//

import SwiftUI
import Observation

struct TemplatesHomeView: View {
    let model: AuthViewModel
    let home = HomeViewModel()

    // UI local state
    @State private var showDebugOverlay: Bool = false
    @State private var showSettings: Bool = false
    @State private var showNotifications: Bool = false

    private let gridCols: [GridItem] = [
        GridItem(.flexible(), spacing: 12, alignment: .top),
        GridItem(.flexible(), spacing: 12, alignment: .top)
    ]

    var body: some View {
        @Bindable var home = home
        ZStack {
            GlassBackgroundView()

            ScrollView(showsIndicators: false) {
                VStack(alignment: .leading, spacing: 16) {
                    headerSection

                    searchAndFiltersSection

                    featuredCarouselSection

                    templatesGridSection

                    recentResultsSection
                }
                .padding(.horizontal, 16)
                .padding(.bottom, 96) // leave space for FAB
                .padding(.top, 8)
            }
            .overlay(alignment: .top) {
                // Loading / Error banners
                if home.isLoading {
                    HUDGlass(text: "Đang tải…")
                        .transition(.opacity)
                        .padding(.top, 8)
                } else if let err = home.errorMessage, !err.isEmpty {
                    BannerGlass(text: err, tint: .red) {
                        withAnimation { home.fetchInitial() }
                    }
                    .transition(.move(edge: .top).combined(with: .opacity))
                    .padding(.top, 8)
                }
            }

            // Floating Create button
            VStack {
                Spacer()
                HStack {
                    Spacer()
                    GlassFloatingButton(systemImage: "sparkles") {
                        // TODO: Wire into create flow
                        UIImpactFeedbackGenerator(style: .medium).impactOccurred()
                    }
                    .padding(.trailing, 20)
                    .padding(.bottom, 28)
                }
            }

            // Debug Overlay (DEBUG only)
            #if DEBUG
            if showDebugOverlay {
                VStack {
                    HStack {
                        DebugOverlay()
                        Spacer()
                    }
                    Spacer()
                }
                .transition(.opacity.combined(with: .move(edge: .top)))
            }
            #endif
        }
        .navigationBarHidden(true)
        .onAppear {
            // Load data
            if home.allTemplates.isEmpty {
                if let token = model.loadToken() {
                    let repo = TemplatesRepository()
                    home.fetchFromAPI(
                        repo: repo,
                        bearerIDToken: token,
                        limit: 12,
                        offset: 0,
                        tokenProvider: { try await model.fetchFreshIDToken() }
                    )
                } else {
                    home.fetchInitial()
                }
            }
        }
        .sheet(isPresented: $showSettings) {
            PlaceholderSheet(title: "Settings")
        }
        .sheet(isPresented: $showNotifications) {
            PlaceholderSheet(title: "Notifications")
        }
    }

    // MARK: - Sections

    private var headerSection: some View {
        HStack(alignment: .center, spacing: 12) {
            avatarView
                .onTapGesture(count: 3) { // Hidden debug gesture
                    #if DEBUG
                    withAnimation(.spring(response: 0.35, dampingFraction: 0.85)) {
                        showDebugOverlay.toggle()
                    }
                    #endif
                }

            VStack(alignment: .leading, spacing: 2) {
                Text("Xin chào, \(greetingName()) 👋")
                    .font(.title2.weight(.semibold))
                    .foregroundStyle(.white)
                    .accessibilityAddTraits(.isHeader)
                Text("Sẵn sàng tạo phong cách ảnh hôm nay?")
                    .font(.subheadline)
                    .foregroundStyle(.white.opacity(0.9))
                    .accessibilityHint("Hãy chọn một template để bắt đầu")
            }

            Spacer()

            HStack(spacing: 12) {
                Button {
                    UIImpactFeedbackGenerator(style: .light).impactOccurred()
                    showNotifications = true
                } label: {
                    Image(systemName: "bell")
                        .font(.headline)
                        .foregroundStyle(.white)
                        .frame(width: 36, height: 36)
                        .background(.ultraThinMaterial, in: Circle())
                        .overlay(Circle().stroke(.white.opacity(0.25), lineWidth: 1))
                }
                Button {
                    UIImpactFeedbackGenerator(style: .light).impactOccurred()
                    showSettings = true
                } label: {
                    Image(systemName: "gearshape")
                        .font(.headline)
                        .foregroundStyle(.white)
                        .frame(width: 36, height: 36)
                        .background(.ultraThinMaterial, in: Circle())
                        .overlay(Circle().stroke(.white.opacity(0.25), lineWidth: 1))
                }
            }
        }
        .padding(.top, 8)
    }

    private var searchAndFiltersSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            // Search pill
            HStack(spacing: 8) {
                Image(systemName: "magnifyingglass")
                    .foregroundStyle(.white.opacity(0.9))
                TextField(
                    "Search styles or tags…",
                    text: Binding(
                        get: { home.searchText },
                        set: { home.searchText = $0 }
                    )
                )
                    .textInputAutocapitalization(.never)
                    .disableAutocorrection(true)
                    .foregroundStyle(.white)
                if !home.searchText.isEmpty {
                    Button {
                        home.searchText = ""
                    } label: {
                        Image(systemName: "xmark.circle.fill")
                            .foregroundStyle(.white.opacity(0.9))
                    }
                    .accessibilityLabel(Text("Clear search"))
                }
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 10)
            .background(.ultraThinMaterial, in: Capsule())
            .overlay(Capsule().stroke(.white.opacity(0.25), lineWidth: 1))

            // Segmented filters
            Picker(
                "Filter",
                selection: Binding(
                    get: { home.selectedFilter },
                    set: { home.selectedFilter = $0 }
                )
            ) {
                ForEach(HomeViewModel.Filter.allCases) { f in
                    Text(f.rawValue).tag(f)
                }
            }
            .pickerStyle(.segmented)
            .accessibilityLabel(Text("Template filters"))
        }
    }

    private var featuredCarouselSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Featured")
                .font(.title3.weight(.semibold))
                .foregroundStyle(.white)
                .padding(.leading, 4)

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 14) {
                    ForEach(home.featured) { item in
                        CardGlassLarge(
                            title: item.title,
                            subtitle: item.subtitle,
                            badge: item.isNew ? "New" : (item.isTrending ? "Popular" : nil),
                            image: Image(systemName: item.thumbnailSymbol ?? "photo"),
                            parallax: 12
                        )
                        .frame(width: 320, height: 240)
                        .onTapGesture {
                            // TODO: Navigate to template detail
                            UIImpactFeedbackGenerator(style: .light).impactOccurred()
                        }
                        .contextMenu {
                            Button("Preview", systemImage: "eye") {}
                            Button(home.isFavorite(item) ? "Remove Favorite" : "Add Favorite",
                                   systemImage: home.isFavorite(item) ? "heart.slash" : "heart") {
                                home.toggleFavorite(item)
                            }
                        }
                    }
                }
                .padding(.horizontal, 4)
                .padding(.vertical, 4)
            }
        }
    }

    private var templatesGridSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Templates")
                .font(.title3.weight(.semibold))
                .foregroundStyle(.white)
                .padding(.leading, 4)

            LazyVGrid(columns: gridCols, spacing: 12) {
                ForEach(home.filteredTemplates) { item in
                    CardGlassSmall(
                        title: item.title,
                        tag: item.tag,
                        image: Image(systemName: item.thumbnailSymbol ?? "photo")
                    )
                    .overlay(alignment: .topTrailing) {
                        favoriteBadge(isFav: home.isFavorite(item))
                            .padding(8)
                    }
                    .onTapGesture {
                        UIImpactFeedbackGenerator(style: .light).impactOccurred()
                        // TODO: Navigate to template detail
                    }
                    .contextMenu {
                        Button("Preview", systemImage: "eye") {}
                        Button(home.isFavorite(item) ? "Remove Favorite" : "Add Favorite",
                               systemImage: home.isFavorite(item) ? "heart.slash" : "heart") {
                            home.toggleFavorite(item)
                        }
                    }
                }
            }
        }
    }

    private var recentResultsSection: some View {
        // Optional; show only when recent exists
        Group {
            if !home.recentResults.isEmpty {
                VStack(alignment: .leading, spacing: 8) {
                    Text("Recent Results")
                        .font(.title3.weight(.semibold))
                        .foregroundStyle(.white)
                        .padding(.leading, 4)

                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 12) {
                            ForEach(home.recentResults, id: \.self) { _ in
                                Rectangle()
                                    .fill(.ultraThinMaterial)
                                    .frame(width: 100, height: 140)
                                    .overlay(
                                        RoundedRectangle(cornerRadius: 16)
                                            .stroke(.white.opacity(0.25), lineWidth: 1)
                                    )
                                    .clipShape(RoundedRectangle(cornerRadius: 16))
                                    .shadow(color: .black.opacity(0.25), radius: 20, x: 0, y: 10)
                                    .onTapGesture {
                                        // TODO: open processed image detail/share
                                    }
                            }
                        }
                        .padding(.horizontal, 4)
                        .padding(.vertical, 4)
                    }
                }
            }
        }
    }

    // MARK: - Subviews

    private var avatarView: some View {
        Group {
            if let url = model.avatarURL {
                AsyncImage(url: url) { phase in
                    switch phase {
                    case .success(let img):
                        img.resizable().scaledToFill()
                    case .failure(_):
                        Image(systemName: "person.crop.circle.fill")
                            .resizable().scaledToFill()
                    case .empty:
                        ProgressView().progressViewStyle(.circular)
                    @unknown default:
                        Color.clear
                    }
                }
                .frame(width: 44, height: 44)
                .clipShape(Circle())
                .overlay(Circle().stroke(.white.opacity(0.25), lineWidth: 1))
                .shadow(color: .black.opacity(0.25), radius: 15, x: 0, y: 8)
                .accessibilityLabel(Text("Avatar"))
            } else {
                Image(systemName: "person.crop.circle")
                    .resizable().scaledToFit()
                    .frame(width: 44, height: 44)
                    .foregroundStyle(.white)
                    .overlay(Circle().stroke(.white.opacity(0.25), lineWidth: 1))
                    .shadow(color: .black.opacity(0.25), radius: 15, x: 0, y: 8)
                    .accessibilityLabel(Text("Avatar"))
            }
        }
    }

    private func favoriteBadge(isFav: Bool) -> some View {
        Group {
            if isFav {
                GlassChip(text: "Fav", systemImage: "heart.fill")
            }
        }
    }

    private func greetingName() -> String {
        let trimmed = model.name.trimmingCharacters(in: .whitespacesAndNewlines)
        return trimmed.isEmpty ? "bạn" : trimmed
    }
}

// MARK: - Reusable Overlays

private struct HUDGlass: View {
    var text: String
    var body: some View {
        HStack(spacing: 8) {
            ProgressView().progressViewStyle(.circular)
            Text(text).font(.footnote)
        }
        .padding(.horizontal, 12).padding(.vertical, 8)
        .background(.ultraThinMaterial, in: Capsule())
        .overlay(Capsule().stroke(.white.opacity(0.25), lineWidth: 1))
    }
}

private struct BannerGlass: View {
    var text: String
    var tint: Color
    var retry: (() -> Void)?
    var body: some View {
        HStack(spacing: 10) {
            Image(systemName: "exclamationmark.triangle.fill")
                .foregroundStyle(tint)
            Text(text)
                .lineLimit(2)
            Spacer()
            if let retry {
                Button("Thử lại", action: retry)
                    .buttonStyle(GlassCTAButtonStyle())
            }
        }
        .font(.footnote)
        .padding(12)
        .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 14, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 14, style: .continuous)
                .stroke(.white.opacity(0.25), lineWidth: 1)
        )
        .padding(.horizontal, 16)
    }
}

private struct PlaceholderSheet: View {
    var title: String
    @Environment(\.dismiss) private var dismiss
    var body: some View {
        NavigationStack {
            VStack(spacing: 12) {
                Text("\(title)")
                    .font(.title2.weight(.semibold))
                Text("Đang phát triển…")
                    .foregroundStyle(.secondary)
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .background(GlassBackgroundView())
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Đóng") {
                        dismiss()
                    }
                }
            }
        }
    }
}

// MARK: - Preview

#Preview("Home") {
    let auth = AuthViewModel(authService: AuthService(), userRepository: UserRepository())
    TemplatesHomeView(model: auth)
}
