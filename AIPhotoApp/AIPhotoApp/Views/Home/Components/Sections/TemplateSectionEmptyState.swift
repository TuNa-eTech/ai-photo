//
//  TemplateSectionEmptyState.swift
//  AIPhotoApp
//
//  Empty state view for template sections
//

import SwiftUI

struct TemplateSectionEmptyState: View {
    let message: String
    
    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: "sparkles")
                .font(.system(size: 48, weight: .light))
                .foregroundStyle(GlassTokens.textSecondary.opacity(0.6))
            Text(message)
                .font(.subheadline)
                .foregroundStyle(GlassTokens.textSecondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 48)
    }
}

#Preview {
    TemplateSectionEmptyState(message: "No templates available")
        .padding()
        .background(Color.black)
}

