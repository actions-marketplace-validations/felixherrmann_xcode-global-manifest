// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "App",
    dependencies: [
        .package(url: "https://github.com/apple/swift-algorithms.git", exact: "1.1.0", traits: ["Accelerate"]),
        .package(url: "https://github.com/apple/swift-algorithms.git", .exact("1.1.0")),
    ]
)
