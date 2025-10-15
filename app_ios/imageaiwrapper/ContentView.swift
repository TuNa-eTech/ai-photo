//
//  ContentView.swift
//  imageaiwrapper
//
//  Created by Anh Tu on 9/10/25.
//

import SwiftUI
import Supabase

struct ContentView: View {
    @State private var session: Session? = nil

    var body: some View {
        Group {
            if session != nil {
                // If the user is logged in, show the HomeView.
                HomeView()
            } else {
                // If the user is not logged in, show the AuthView.
                AuthView()
            }
        }
        .task {
            // Listen for authentication state changes.
            // This will automatically update the `session` state variable.
            for await (_, session) in supabase.auth.authStateChanges {
                self.session = session
            }
        }
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}
