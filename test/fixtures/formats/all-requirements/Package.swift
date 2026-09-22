// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "AllRequirements",
    dependencies: [
        .package(url: "https://example.com/exact.git", exact: "1.2.3"),
        .package(url: "https://example.com/from.git", from: "1.2.3"),
        .package(url: "https://example.com/minor.git", .upToNextMinor(from: "1.2.3")),
        .package(url: "https://example.com/major.git", .upToNextMajor(from: "1.2.3")),
        .package(url: "https://example.com/range.git", "1.0.0"..<"2.0.0"),
        .package(url: "https://example.com/closed.git", "1.0.0"..."2.0.0"),
        .package(url: "https://example.com/branch.git", branch: "main"),
        .package(url: "https://example.com/revision.git", revision: "abcdef"),
        .package(url: "https://example.com/exact-expression.git", .exact("1.2.3")),
        .package(url: "https://example.com/branch-expression.git", .branch("main")),
        .package(url: "https://example.com/revision-expression.git", .revision("abcdef")),
        .package(path: "../LocalPackage"),
        .package(id: "mona.LinkedList", from: "1.0.0"),
    ]
)
