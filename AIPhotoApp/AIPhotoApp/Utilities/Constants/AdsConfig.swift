//
//  AdsConfig.swift
//  AIPhotoApp
//
//  Created by Anh Tu on 10/11/25.
//

enum AdsConfig {
    /// Use the official AdMob test ad ID when running in debug; otherwise, use the production real ad unit ID.
    static var rewardedAdsID: String {
#if DEBUG
        return "ca-app-pub-3940256099942544/1712485313"
#else
        return "ca-app-pub-9465223332350837/5336532285"
#endif
    }
}
