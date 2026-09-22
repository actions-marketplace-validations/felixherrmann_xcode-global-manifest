import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { swiftManifest } from '../../dist/formats/swift.js';
import { xcodeProject } from '../../dist/formats/xcode-project.js';
import type { Files } from '../../src/model.ts';
import type { SourceFile } from '../../src/snapshot.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const fixtures = path.resolve(__dirname, '../fixtures');
const globalPath = 'App.xcodeproj/project.xcworkspace/xcshareddata/swiftpm/Package.swift';

function readFixture(relative: string): string {
  return fs.readFileSync(path.join(fixtures, relative), 'utf8');
}

function readTree(relative: string): Files {
  const root = path.join(fixtures, relative);
  if (!fs.existsSync(root)) return {};
  const files: Record<string, string> = {};

  function visit(directory: string): void {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (entry.name === '.build' || entry.name === 'Package.resolved') continue;
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) visit(absolute);
      if (entry.isFile()) {
        const file = path.relative(root, absolute).split(path.sep).join('/');
        files[file] = fs.readFileSync(absolute, 'utf8');
      }
    }
  }

  visit(root);
  return files;
}

function findResolvedPath(relative: string): string | undefined {
  const root = path.join(fixtures, relative);
  if (!fs.existsSync(root)) return undefined;
  const matches: string[] = [];

  function visit(directory: string): void {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) visit(absolute);
      if (entry.isFile() && entry.name === 'Package.resolved') {
        matches.push(path.relative(root, absolute).split(path.sep).join('/'));
      }
    }
  }

  visit(root);
  if (matches.length > 1) throw new Error(`${relative}: expected at most one Package.resolved`);
  return matches[0];
}

function loadScenario(name: string): {
  base: Files;
  head: Files;
  expected: Files;
  sources: SourceFile[];
  globalPath: string;
} {
  const resolvedPath = findResolvedPath(`scenarios/${name}/head`) ?? findResolvedPath(`scenarios/${name}/base`);
  const scenarioGlobalPath = resolvedPath
    ? path.posix.join(path.posix.dirname(resolvedPath), 'Package.swift')
    : globalPath;
  const base = readTree(`scenarios/${name}/base`);
  const head = readTree(`scenarios/${name}/head`);
  const expected = readTree(`scenarios/${name}/expected`);
  const sourcePaths = [...new Set([...Object.keys(base), ...Object.keys(head)])]
    .filter(file => file !== scenarioGlobalPath && (file.endsWith('/Package.swift') || file === 'Package.swift' || file.endsWith('.xcodeproj/project.pbxproj')))
    .sort();
  const sources = sourcePaths.map(file => ({
    file,
    format: file.endsWith('.pbxproj') ? xcodeProject : swiftManifest,
  }));
  return { base, head, expected, sources, globalPath: scenarioGlobalPath };
}

export { fixtures, globalPath, loadScenario, readFixture, readTree };
