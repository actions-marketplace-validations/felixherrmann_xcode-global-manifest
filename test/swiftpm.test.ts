import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { generate } from '../dist/formats/swift.js';
import { fixtures, readFixture } from './helpers/fixtures.ts';
import type { Rule } from '../src/model.ts';

test('SwiftPM accepts the generated Package.swift fixture containing every supported rule', { skip: !spawnSync('swift', ['--version']).stdout?.length }, () => {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'global-manifest-'));
  const cache = path.join(temporary, 'cache');
  const packagePath = path.join(temporary, 'package');
  fs.mkdirSync(cache);
  fs.mkdirSync(packagePath);
  fs.copyFileSync(path.join(fixtures, 'formats/generated/Package.swift'), path.join(packagePath, 'Package.swift'));
  const rules: Rule[] = [
    { kind: 'exact', value: '1.0.0' },
    { kind: 'major', value: '1.0.0' },
    { kind: 'minor', value: '1.0.0' },
    { kind: 'range', min: '1.0.0', max: '2.0.0' },
    { kind: 'closed', min: '1.0.0', max: '2.0.0' },
    { kind: 'branch', value: 'main' },
    { kind: 'revision', value: 'abcdef' },
  ];
  try {
    assert.equal(
      generate(new Map(rules.map((rule, i) => [`https://github.com/example/Package${i}.git`, { rule }]))),
      readFixture('formats/generated/Package.swift'),
    );
    const result = spawnSync('swift', ['package', '--disable-sandbox', 'dump-package', '--package-path', packagePath], {
      encoding: 'utf8',
      env: { ...process.env, XDG_CACHE_HOME: cache, CLANG_MODULE_CACHE_PATH: cache, SWIFTPM_MODULECACHE_OVERRIDE: cache },
    });
    assert.equal(result.status, 0, result.stderr);
    assert.equal(JSON.parse(result.stdout).dependencies.length, rules.length);
  } finally {
    fs.rmSync(temporary, { recursive: true, force: true });
  }
});
