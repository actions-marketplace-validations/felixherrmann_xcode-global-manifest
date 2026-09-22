// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "Essentials",
    dependencies: [
        .package(url: "https://github.com/apple/swift-algorithms.git", exact: "1.2.0"),
        .package(url: "https://github.com/apple/swift-log.git", from: "1.5.0"),
        .package(path: "../LocalUtilities"),
        .package(id: "mona.LinkedList", from: "1.0.0"),
    ]
)
