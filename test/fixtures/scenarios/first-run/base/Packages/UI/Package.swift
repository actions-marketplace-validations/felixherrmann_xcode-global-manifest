// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "UI",
    dependencies: [
        .package(url: "https://github.com/apple/swift-algorithms.git", exact: "1.2.0"),
        .package(path: "../Essentials"),
    ]
)
