//
//  ContentView.swift
//  imageaiwrapper
//
//  Created by Anh Tu on 9/10/25.
//

import SwiftUI
struct ContentView: View {
    @ObservedObject private var authManager = FirebaseAuthManager.shared

    var body: some View {
        Group {
            if authManager.user != nil {
                HomeView()
            } else {
                AuthView()
            }
        }
        .onAppear {
            authManager.refreshIDToken()
        }
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}
