//
//  ContentView.swift
//  AIPhotoApp
//
//  Created by Anh Tu on 18/10/25.
//

import SwiftUI
import SwiftData

struct ContentView: View {

    var body: some View {
        NavigationSplitView {
            List {
            }
            .toolbar {
                
            }
        } detail: {
            Text("Select an item")
        }
    }
}

#Preview {
    ContentView()
}
