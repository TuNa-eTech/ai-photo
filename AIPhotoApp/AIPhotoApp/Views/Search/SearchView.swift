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
    @State private var categoryManager = CategoryManager()
    
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
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .principal) {
                    Text(L10n.tr("l10n.search.title"))
                        .font(.system(size: 20, weight: .semibold))
                        .foregroundStyle(Color.primary)
                }
            }
            .searchable(
                text: $searchText,
                placement: .navigationBarDrawer(displayMode: .always),
                prompt: Text(L10n.tr("l10n.search.prompt"))
            )
            .textInputAutocapitalization(.never)
            .autocorrectionDisabled()
            .onAppear {
                // Load categories from API
                if let token = model.loadToken() {
                    categoryManager.loadCategories(
                        bearerIDToken: token,
                        tokenProvider: { try await model.fetchFreshIDToken() }
                    )
                }
                // Load initial templates if empty
                if home.allTemplates.isEmpty {
                    loadTemplates(query: nil, category: nil, sort: nil)
                }
            }
            .onChange(of: searchText) { oldValue, newValue in
                performSearch(query: newValue)
            }
            .onChange(of: selectedCategory) { oldValue, newValue in
                // Reload templates when category changes
                let categoryId = newValue.id == "all" ? nil : newValue.id
                loadTemplates(query: searchText.isEmpty ? nil : searchText, category: categoryId, sort: sortForFilter(selectedFilter))
            }
            .onChange(of: selectedFilter) { oldValue, newValue in
                // Reload templates when filter type changes
                let categoryId = selectedCategory.id == "all" ? nil : selectedCategory.id
                loadTemplates(query: searchText.isEmpty ? nil : searchText, category: categoryId, sort: sortForFilter(newValue))
            }
        }
        .navigationDestination(item: $selectedTemplate) { template in
            TemplateSelectionView(template: template)
        }
    }
    
    private var categorySection: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 12) {
                ForEach(categoryManager.allCategories) { category in
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
        .scrollClipDisabled(false)
        .accessibilityElement(children: .contain)
        .accessibilityLabel(Text(L10n.tr("l10n.search.categoryFilters")))
    }
    
    private var filterSection: some View {
        Picker(L10n.tr("l10n.search.filter"), selection: $selectedFilter) {
            ForEach(FilterType.allCases) { filter in
                Text(filter.rawValue).tag(filter)
            }
        }
        .pickerStyle(.segmented)
        .accessibilityLabel(Text(L10n.tr("l10n.search.templateFilters")))
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
                            GlassChip(text: L10n.tr("l10n.common.fav"), systemImage: "heart.fill")
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
                        Button(L10n.tr("l10n.templates.preview"), systemImage: "eye") {}
                        Button(home.isFavorite(item) ? L10n.tr("l10n.templates.removeFavorite") : L10n.tr("l10n.templates.addFavorite"),
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
            Text(L10n.tr("l10n.search.searching"))
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
            
            Text(searchText.isEmpty ? L10n.tr("l10n.search.start") : L10n.tr("l10n.search.noResults"))
                .font(.title3.weight(.semibold))
                .foregroundStyle(GlassTokens.textPrimary)
            
            if !searchText.isEmpty {
                Text(L10n.tr("l10n.search.tryDifferent"))
                    .font(.subheadline)
                    .foregroundStyle(GlassTokens.textSecondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 40)
            } else {
                Text(L10n.tr("l10n.search.hint"))
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
    
    // No client-side filtering needed - API handles all filtering
    private var filteredTemplates: [HomeViewModel.TemplateItem] {
        return home.allTemplates
    }
    
    // Helper: Map filter type to API sort parameter
    private func sortForFilter(_ filter: FilterType) -> String {
        switch filter {
        case .trending:
            return "popular"
        case .new:
            return "newest"
        case .all:
            return "newest" // Default to newest
        }
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
                let categoryId = selectedCategory.id == "all" ? nil : selectedCategory.id
                loadTemplates(query: trimmedQuery.isEmpty ? nil : trimmedQuery, category: categoryId, sort: sortForFilter(selectedFilter))
            }
        }
    }
    
    private func loadTemplates(query: String?, category: String?, sort: String?) {
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
            category: category,
            sort: sort,
            tokenProvider: { try await model.fetchFreshIDToken() }
        )
    }
}

// MARK: - Category Chip Button (iOS Design Standards)

private struct CategoryChipButton: View {
    let category: TemplateCategory
    let isSelected: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: {
            #if canImport(UIKit)
            let generator = UIImpactFeedbackGenerator(style: .light)
            generator.impactOccurred()
            #endif
            action()
        }) {
            HStack(spacing: 6) {
                Image(systemName: category.icon)
                    .font(.system(size: 13, weight: isSelected ? .semibold : .regular))
                    .foregroundStyle(isSelected ? Color.accentColor : Color.secondary)
                
                Text(category.name)
                    .font(.system(size: 15, weight: isSelected ? .semibold : .regular))
                    .foregroundStyle(isSelected ? Color.primary : Color.secondary)
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 8)
            .background {
                Capsule()
                    .fill(isSelected ? Color.accentColor.opacity(0.15) : Color.clear)
                    .overlay {
                        Capsule()
                            .strokeBorder(
                                isSelected ? Color.accentColor.opacity(0.3) : Color.secondary.opacity(0.2),
                                lineWidth: isSelected ? 1.5 : 1
                            )
                    }
            }
        }
        .buttonStyle(.plain)
        .accessibilityLabel(Text(category.name))
        .accessibilityAddTraits(isSelected ? [.isButton, .isSelected] : .isButton)
    }
}

// MARK: - Preview

#Preview {
    let authViewModel = AuthViewModel(authService: AuthService(), userRepository: UserRepository())
    return SearchView()
        .environment(authViewModel)
}

