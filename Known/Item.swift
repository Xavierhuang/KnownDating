//
//  Item.swift
//  Known
//
//  Created by Weijia Huang on 1/10/26.
//

import Foundation
import SwiftData

@Model
final class Item {
    var timestamp: Date
    
    init(timestamp: Date) {
        self.timestamp = timestamp
    }
}
