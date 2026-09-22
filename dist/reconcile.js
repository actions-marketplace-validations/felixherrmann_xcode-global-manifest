"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reconcile = reconcile;
exports.sameDependencies = sameDependencies;
const model_1 = require("./model");
/** Merge requirement changes per package; source files own package membership. */
function reconcile(base, head, globalPath) {
    validateBaseline(base, head, globalPath);
    const dependencies = new Map();
    const sourceUpdates = new Map();
    const urls = new Set([...base.sources.keys(), ...head.sources.keys(), ...(head.global?.keys() ?? [])]);
    for (const url of urls) {
        const sourceBefore = base.sources.get(url);
        const sourceNow = head.sources.get(url);
        const globalBefore = base.global?.get(url);
        const globalNow = head.global?.get(url);
        const sourceChanged = !(0, model_1.sameRequirement)(sourceBefore?.rule, sourceNow?.rule);
        const globalChanged = base.global !== null && !(0, model_1.sameRequirement)(globalBefore?.rule, globalNow?.rule);
        const membershipChanged = globalChanged && (!globalBefore || !globalNow);
        if (membershipChanged && (!sourceChanged || !(0, model_1.sameRequirement)(sourceNow?.rule, globalNow?.rule))) {
            throw new Error(`${globalPath}: add or remove ${url} in source manifests`);
        }
        if (globalChanged && sourceChanged && !(0, model_1.sameRequirement)(sourceNow?.rule, globalNow?.rule)) {
            const location = sourceNow ? `${sourceNow.file}:${sourceNow.line}` : 'source removed';
            throw new Error(`sync conflict for ${url}: ${location} and ${globalPath}:${globalNow.line}`);
        }
        const dependency = globalChanged ? globalNow : sourceNow;
        if (dependency)
            dependencies.set(url, dependency);
        if (globalChanged && globalNow)
            sourceUpdates.set(url, globalNow.rule);
    }
    return { dependencies, sourceUpdates };
}
function sameDependencies(a, b) {
    return a.size === b.size && [...a].every(([url, dependency]) => (0, model_1.sameRequirement)(dependency.rule, b.get(url)?.rule));
}
function validateBaseline(base, head, globalPath) {
    if (base.global)
        assertInSync(base.sources, base.global, 'base commit');
    if (!base.global && head.global)
        assertInSync(head.sources, head.global, 'initial global manifest');
    if (base.global && !head.global) {
        throw new Error(`${globalPath}: global manifest was removed; remove packages in source files instead`);
    }
}
function assertInSync(sources, global, description) {
    for (const url of new Set([...sources.keys(), ...global.keys()])) {
        if (!(0, model_1.sameRequirement)(sources.get(url)?.rule, global.get(url)?.rule)) {
            throw new Error(`${description} is out of sync for ${url}`);
        }
    }
}
