"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readConfig = readConfig;
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const swift_1 = require("../formats/swift");
const xcode_project_1 = require("../formats/xcode-project");
function readConfig() {
    const event = JSON.parse(node_fs_1.default.readFileSync(required('GITHUB_EVENT_PATH'), 'utf8'));
    const pullRequest = event.pull_request;
    if (!pullRequest || pullRequest.head.repo.full_name !== pullRequest.base.repo.full_name ||
        pullRequest.base.repo.full_name !== process.env.GITHUB_REPOSITORY) {
        throw new Error('the action requires a same-repository pull_request_target event');
    }
    const resolvedPath = process.env['INPUT_RESOLVED-FILE'];
    const manifests = inputPaths(process.env.INPUT_MANIFESTS || '');
    const projects = inputPaths(process.env.INPUT_PROJECTS || '');
    if (!resolvedPath || !manifests.length)
        throw new Error('resolved-file and at least one manifest are required');
    if (projects.some(file => manifests.includes(file))) {
        throw new Error('a source path cannot be both a manifest and an Xcode project');
    }
    const globalPath = node_path_1.default.posix.join(node_path_1.default.posix.dirname(resolvedPath), 'Package.swift');
    if ([...manifests, ...projects].includes(globalPath)) {
        throw new Error('the generated manifest cannot be a source manifest or Xcode project');
    }
    return {
        root: required('GITHUB_WORKSPACE'),
        pullRequest,
        resolvedPath,
        globalPath,
        sources: [
            ...manifests.map(file => ({ file, format: swift_1.swiftManifest })),
            ...projects.map(file => ({ file, format: xcode_project_1.xcodeProject })),
        ],
        watchedPaths: [...manifests, ...projects, globalPath],
        outputPath: required('GITHUB_OUTPUT'),
    };
}
function inputPaths(input) {
    return [...new Set(input.split('\n').map(value => value.trim()).filter(Boolean))];
}
function required(name) {
    const value = process.env[name];
    if (!value)
        throw new Error(`${name} is required`);
    return value;
}
