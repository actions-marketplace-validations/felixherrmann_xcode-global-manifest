import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { synchronize } from '../dist/sync.js';
import { loadScenario } from './helpers/fixtures.ts';

const scenarios = [
  ['first run creates a global manifest from Swift packages and an Xcode project', 'first-run'],
  ['a standalone workspace contains the generated global manifest', 'standalone-workspace'],
  ['a source requirement change regenerates the global manifest', 'source-change'],
  ['a global requirement change updates every source occurrence', 'global-change'],
  ['independent source and global changes merge package by package', 'independent-changes'],
  ['source dependency additions and removals update the global set', 'add-and-remove'],
  ['global changes update multiple manifests and an Xcode project', 'multi-source-project'],
  ['the same requirement change on both sides is already synchronized', 'same-change'],
];

describe('repository scenarios', () => {
  for (const [title, name] of scenarios) {
    test(title, () => {
      const scenario = loadScenario(name);
      const updates = synchronize(scenario);
      assert.deepEqual(updates, scenario.expected);

      const synchronized = { ...scenario.head, ...updates };
      assert.deepEqual(synchronize({ ...scenario, head: synchronized }), {});
    });
  }
});
