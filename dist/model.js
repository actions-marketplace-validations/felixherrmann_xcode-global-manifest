"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sameRequirement = sameRequirement;
function sameRequirement(a, b) {
    if (!a || !b)
        return a === b;
    if (a.kind === 'range' || a.kind === 'closed') {
        return a.kind === b.kind && a.min === b.min && a.max === b.max;
    }
    return b.kind !== 'range' && b.kind !== 'closed' && a.kind === b.kind && a.value === b.value;
}
