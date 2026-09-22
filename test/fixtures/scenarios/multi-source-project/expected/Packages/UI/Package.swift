// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "UI",
    dependencies: [
        .package(url: "https://github.com/apple/swift-algorithms.git", "1.1.0"..<"2.0.0"),
        .package(url: "https://github.com/apple/swift-log.git", revision: "abc123"),
    ]
)
