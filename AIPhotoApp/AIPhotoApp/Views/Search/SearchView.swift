//
//  SearchView.swift
//  AIPhotoApp
//
//  Search view for templates with API integration and debouncing
//  Designed with Liquid Glass Beige Minimalist design system
//

import SwiftUI

struct SearchView: View {
    @Environment(AuthViewModel.self) private var model
    @State private var home = HomeViewModel()
    
    @State private var searchText: String = ""
    @State private var selectedCategory: TemplateCategory = .all
    @State private var selectedFilter: FilterType = .all
    @State private var selectedTemplate: TemplateDTO?
    @State private var debounceTask: Task<Void, Never>?
    
    enum FilterType: String, CaseIterable, Identifiable {
        case all = "All"
        case trending = "Trending"
        case new = "New"
        
        var id: String { rawValue }
    }
    
    private let gridCols: [GridItem] = [
        GridItem(.flexible(), spacing: 16, alignment: .top),
        GridItem(.flexible(), spacing: 16, alignment: .top)
    ]
    
    var body: some View {
        NavigationStack {
            ZStack {
                GlassBackgroundView()
                
                VStack(spacing: 0) {
                    // Category filters
                    categorySection
                    
                    // Filter segment
                    filterSection
                        .padding(.horizontal, 20)
                        .padding(.vertical, 12)
                    
                    // Templates grid or empty state
                    if home.isLoading {
                        loadingView
                    } else if filteredTemplates.isEmpty {
                        emptyStateView
                    } else {
                        templatesGrid
                    }
                }
            }
            .navigationTitle("Search")
            .navigationBarTitleDisplayMode(.large)
            .searchable(
                text: $searchText,
                placement: .navigationBarDrawer(displayMode: .always),
                prompt: "Search templates…"
            )
            .textInputAutocapitalization(.never)
            .autocorrectionDisabled()
            .onAppear {
                // Load initial templates if empty
                if home.allTemplates.isEmpty {
                    loadTemplates(query: nil)
                }
            }
            .onChange(of: searchText) { oldValue, newValue in
                performSearch(query: newValue)
            }
        }
        .sheet(item: $selectedTemplate) { template in
            TemplateSelectionView(template: template)
        }
    }
    
    private var categorySection: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 10) {
                ForEach(TemplateCategory.allCategories) { category in
                    CategoryChipButton(
                        category: category,
                        isSelected: selectedCategory.id == category.id
                    ) {
                        withAnimation(.spring(response: 0.3, dampingFraction: 0.7)) {
                            selectedCategory = category
                        }
                    }
                }
            }
            .padding(.horizontal, 20)
            .padding(.vertical, 12)
        }
        .accessibilityElement(children: .contain)
        .accessibilityLabel(Text("Category filters"))
    }
    
    private var filterSection: some View {
        Picker("Filter", selection: $selectedFilter) {
            ForEach(FilterType.allCases) { filter in
                Text(filter.rawValue).tag(filter)
            }
        }
        .pickerStyle(.segmented)
        .accessibilityLabel(Text("Template filters"))
    }
    
    private var templatesGrid: some View {
        ScrollView(showsIndicators: false) {
            LazyVGrid(columns: gridCols, spacing: 16) {
                ForEach(filteredTemplates) { item in
                    CardGlassSmall(
                        title: item.title,
                        tag: item.tag,
                        thumbnailURL: item.thumbnailURL,
                        thumbnailSymbol: item.thumbnailSymbol
                    )
                    .overlay(alignment: .topTrailing) {
                        if home.isFavorite(item) {
                            GlassChip(text: "Fav", systemImage: "heart.fill")
                                .padding(8)
                        }
                    }
                    .onTapGesture {
                        UIImpactFeedbackGenerator(style: .light).impactOccurred()
                        if let dto = item.dto {
                            selectedTemplate = dto
                        }
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
            .padding(.horizontal, 20)
            .padding(.top, 12)
            .padding(.bottom, 24)
        }
    }
    
    private var loadingView: some View {
        VStack(spacing: 16) {
            ProgressView()
                .tint(GlassTokens.textPrimary)
                .scaleEffect(1.2)
            Text("Searching…")
                .font(.subheadline)
                .foregroundStyle(GlassTokens.textSecondary)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .padding(.top, 60)
    }
    
    private var emptyStateView: some View {
        VStack(spacing: 20) {
            Image(systemName: searchText.isEmpty ? "magnifyingglass" : "tray")
                .font(.system(size: 64, weight: .light))
                .foregroundStyle(GlassTokens.textSecondary.opacity(0.6))
            
            Text(searchText.isEmpty ? "Start searching" : "No results found")
                .font(.title3.weight(.semibold))
                .foregroundStyle(GlassTokens.textPrimary)
            
            if !searchText.isEmpty {
                Text("Try different keywords or filters")
                    .font(.subheadline)
                    .foregroundStyle(GlassTokens.textSecondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 40)
            } else {
                Text("Search for templates by name, category, or tag")
                    .font(.subheadline)
                    .foregroundStyle(GlassTokens.textSecondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 40)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .padding(.top, 60)
    }
    
    // MARK: - Computed
    
    private var filteredTemplates: [HomeViewModel.TemplateItem] {
        var list = home.allTemplates
        
        // Category filter
        if selectedCategory != .all {
            list = list.filter { $0.tag == selectedCategory.id }
        }
        
        // Filter type
        switch selectedFilter {
        case .all:
            break
        case .trending:
            list = list.filter { $0.isTrending }
        case .new:
            list = list.filter { $0.isNew }
        }
        
        // Additional client-side filtering if needed (API already filters by query)
        // This is for cases where we want to refine results further
        
        return list
    }
    
    // MARK: - Actions
    
    private func performSearch(query: String) {
        // Cancel previous debounce task
        debounceTask?.cancel()
        
        let trimmedQuery = query.trimmingCharacters(in: .whitespacesAndNewlines)
        
        // Debounce search: wait 0.5 seconds before performing search
        debounceTask = Task {
            try? await Task.sleep(nanoseconds: 500_000_000) // 0.5 seconds
            
            // Check if task was cancelled
            guard !Task.isCancelled else { return }
            
            await MainActor.run {
                loadTemplates(query: trimmedQuery.isEmpty ? nil : trimmedQuery)
            }
        }
    }
    
    private func loadTemplates(query: String?) {
        guard let token = model.loadToken() else {
            // User not logged in - clear templates and show empty state
            home.allTemplates = []
            home.isLoading = false
            home.errorMessage = nil
            return
        }
        
        home.fetchAllTemplatesFromAPI(
            bearerIDToken: token,
            limit: nil, // Load all for search
            offset: nil,
            query: query,
            tokenProvider: { try await model.fetchFreshIDToken() }
        )
    }
}

// MARK: - Category Chip Button (Reused from AllTemplatesView)

private struct CategoryChipButton: View {
    let category: TemplateCategory
    let isSelected: Bool
    let action: () -> Void
    
    @State private var isPressed = false
    
    var body: some View {
        Button(action: {
            action()
            UIImpactFeedbackGenerator(style: .light).impactOccurred()
        }) {
            HStack(spacing: 8) {
                Image(systemName: category.icon)
                    .imageScale(.small)
                    .foregroundStyle(iconColor)
                
                Text(category.name)
                    .font(.subheadline.weight(isSelected ? .semibold : .regular))
                    .foregroundStyle(GlassTokens.textPrimary)
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 10)
            .background(backgroundView)
            .overlay(borderOverlay)
            .shadow(
                color: isSelected ? category.gradient[0].opacity(0.4) : .clear,
                radius: isSelected ? 8 : 0,
                x: 0,
                y: isSelected ? 4 : 0
            )
            .scaleEffect(isPressed ? 0.95 : 1.0)
            .animation(.spring(response: 0.3, dampingFraction: 0.7), value: isPressed)
            .animation(.spring(response: 0.3, dampingFraction: 0.7), value: isSelected)
        }
        .buttonStyle(.plain)
        .simultaneousGesture(
            DragGesture(minimumDistance: 0)
                .onChanged { _ in isPressed = true }
                .onEnded { _ in isPressed = false }
        )
        .accessibilityLabel(Text(category.name))
        .accessibilityAddTraits(isSelected ? [.isButton, .isSelected] : .isButton)
    }
    
    private var iconColor: AnyShapeStyle {
        if isSelected {
            AnyShapeStyle(category.linearGradient)
        } else {
            AnyShapeStyle(GlassTokens.textSecondary)
        }
    }
    
    @ViewBuilder
    private var backgroundView: some View {
        RoundedRectangle(cornerRadius: 20, style: .continuous)
            .fill(isSelected ? .regularMaterial : .ultraThinMaterial)
    }
    
    @ViewBuilder
    private var borderOverlay: some View {
        RoundedRectangle(cornerRadius: 20, style: .continuous)
            .stroke(
                isSelected
                ? category.linearGradient
                : LinearGradient(
                    colors: [GlassTokens.borderColor.opacity(0.3)],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                ),
                lineWidth: isSelected ? 2 : 0.8
            )
    }
}

// MARK: - Preview

#Preview {
    let authViewModel = AuthViewModel(authService: AuthService(), userRepository: UserRepository())
    return SearchView()
        .environment(authViewModel)
}

