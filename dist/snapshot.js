"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readSnapshot = readSnapshot;
const model_1 = require("./model");
const swift_1 = require("./formats/swift");
function readSnapshot(files, sources, globalPath, allowMissing = false) {
    const documents = [];
    for (const { file, format } of sources) {
        if (!(file in files)) {
            if (allowMissing)
                continue;
            throw new Error(`${file}: source file is missing`);
        }
        documents.push(format.read(files[file], file));
    }
    const global = globalPath in files ? swift_1.swiftManifest.read(files[globalPath], globalPath) : null;
    return {
        documents,
        sources: indexDependencies(documents.flatMap(document => document.dependencies)),
        global: global ? indexDependencies(global.dependencies, globalPath) : null,
    };
}
function indexDependencies(declarations, globalPath) {
    const byURL = new Map();
    for (const declaration of declarations) {
        const previous = byURL.get(declaration.url);
        if (previous) {
            if (globalPath)
                throw new Error(`${globalPath}: duplicate package ${declaration.url}`);
            if (!(0, model_1.sameRequirement)(previous.rule, declaration.rule)) {
                throw new Error(`conflicting requirements for ${declaration.url}: ${previous.file}:${previous.line} and ${declaration.file}:${declaration.line}`);
            }
        }
        else {
            byURL.set(declaration.url, declaration);
        }
    }
    return byURL;
}
