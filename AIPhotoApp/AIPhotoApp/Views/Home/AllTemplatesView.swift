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
            .padding(.horizontal, 16)
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

// MARK: - Category Chip Button

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
    let home = HomeViewModel()
    AllTemplatesView(home: home)
}


