//
//  CategoryScrollView.swift
//  AIPhotoApp
//
//  Horizontal scrolling category navigation
//  Shows all available categories with selection state
//

import SwiftUI

struct CategoryScrollView: View {
    @Binding var selectedCategory: TemplateCategory
    let categories: [TemplateCategory]
    
    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 10) {
                ForEach(categories) { category in
                    CategoryChip(
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
            .padding(.vertical, 8)
        }
        .accessibilityElement(children: .contain)
        .accessibilityLabel(Text("Category filters"))
    }
}

// MARK: - Preview
#Preview {
    @Previewable @State var selectedCategory: TemplateCategory = .all
    
    ZStack {
        GlassBackgroundView()
        
        VStack {
            CategoryScrollView(
                selectedCategory: $selectedCategory,
                categories: TemplateCategory.allCategories
            )
            
            Spacer()
            
            // Show selected category
            Text("Selected: \(selectedCategory.name)")
                .font(.title2)
                .foregroundStyle(.white)
                .padding()
        }
        .padding(.top, 50)
    }
}



