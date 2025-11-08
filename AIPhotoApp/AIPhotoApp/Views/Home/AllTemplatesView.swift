//
//  AllTemplatesView.swift
//  AIPhotoApp
//
//  Full templates view with search, filters, and categories
//

import SwiftUI

struct AllTemplatesView: View {
    let home: HomeViewModel
    
    @Environment(\.dismiss) private var dismiss
    @Environment(AuthViewModel.self) private var authModel
    
    @State private var categoryManager = CategoryManager()
    @State private var searchText: String = ""
    @State private var selectedCategory: TemplateCategory = .all
    @State private var selectedFilter: FilterType = .all
    
    enum FilterType: String, CaseIterable, Identifiable {
        case all = "All"
        case trending = "Trending"
        case new = "New"
        
        var id: String { rawValue }
    }
    
    private let gridCols: [GridItem] = [
        GridItem(.flexible(), spacing: 12, alignment: .top),
        GridItem(.flexible(), spacing: 12, alignment: .top)
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
                        .padding(.horizontal, 16)
                        .padding(.bottom, 12)
                    
                    // Templates grid
                    ScrollView(showsIndicators: false) {
                        LazyVGrid(columns: gridCols, spacing: 12) {
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
                        .padding(.horizontal, 16)
                        .padding(.bottom, 24)
                    }
                }
            }
            .navigationTitle("All Templates")
            .navigationBarTitleDisplayMode(.inline)
            .searchable(
                text: $searchText,
                placement: .navigationBarDrawer(displayMode: .always),
                prompt: "Search templates…"
            )
            .textInputAutocapitalization(.never)
            .autocorrectionDisabled()
            .onAppear {
                // Load categories from API
                if let token = authModel.loadToken() {
                    categoryManager.loadCategories(
                        bearerIDToken: token,
                        tokenProvider: { try await authModel.fetchFreshIDToken() }
                    )
                }
            }
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                    .foregroundStyle(GlassTokens.textPrimary)
                }
            }
        }
    }
    
    // MARK: - Sections
    
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
            .padding(.horizontal, 16)
            .padding(.vertical, 12)
        }
        .scrollClipDisabled(false)
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
        
        // Search
        let q = searchText.trimmingCharacters(in: .whitespacesAndNewlines)
        if !q.isEmpty {
            list = list.filter {
                $0.title.localizedCaseInsensitiveContains(q) ||
                ($0.tag?.localizedCaseInsensitiveContains(q) ?? false) ||
                ($0.subtitle?.localizedCaseInsensitiveContains(q) ?? false)
            }
        }
        
        return list
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
    AllTemplatesView(home: HomeViewModel())
}


