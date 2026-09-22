"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.textDocument = textDocument;
const model_1 = require("../model");
function textDocument(source, file, occurrences, render) {
    return {
        file,
        dependencies: occurrences.map(({ url, rule, file, line }) => ({ url, rule, file, line })),
        update(requirements) {
            let result = source;
            // Work backwards so an edit cannot invalidate the remaining source ranges.
            for (const occurrence of [...occurrences].sort((a, b) => b.start - a.start)) {
                const rule = requirements.get(occurrence.url);
                if (!rule || (0, model_1.sameRequirement)(rule, occurrence.rule))
                    continue;
                result = result.slice(0, occurrence.start) + render(rule, occurrence) + result.slice(occurrence.end);
            }
            return result;
        },
    };
}
