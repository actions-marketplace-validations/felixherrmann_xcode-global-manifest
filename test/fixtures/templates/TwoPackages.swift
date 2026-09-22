// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "App",
    dependencies: [
        .package(url: "https://github.com/example/Package.git", exact: "1.0.0"),
        .package(url: "https://github.com/example/Other", exact: "2.0.0"),
    ]
)
