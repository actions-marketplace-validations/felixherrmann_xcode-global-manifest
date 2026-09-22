import fs from 'node:fs';
import path from 'node:path';
import { swiftManifest } from '../formats/swift';
import { xcodeProject } from '../formats/xcode-project';
import type { SourceFile } from '../snapshot';

type PullRequest = {
  base: { sha: string; repo: { full_name: string } };
  head: { sha: string; ref: string; repo: { full_name: string } };
};

export type ActionConfig = {
  root: string;
  pullRequest: PullRequest;
  resolvedPath: string;
  globalPath: string;
  sources: SourceFile[];
  watchedPaths: string[];
  outputPath: string;
};

export function readConfig(): ActionConfig {
  const event = JSON.parse(fs.readFileSync(required('GITHUB_EVENT_PATH'), 'utf8')) as { pull_request?: PullRequest };
  const pullRequest = event.pull_request;
  if (!pullRequest || pullRequest.head.repo.full_name !== pullRequest.base.repo.full_name ||
      pullRequest.base.repo.full_name !== process.env.GITHUB_REPOSITORY) {
    throw new Error('the action requires a same-repository pull_request_target event');
  }

  const resolvedPath = process.env['INPUT_RESOLVED-FILE'];
  const manifests = inputPaths(process.env.INPUT_MANIFESTS || '');
  const projects = inputPaths(process.env.INPUT_PROJECTS || '');
  if (!resolvedPath || !manifests.length) throw new Error('resolved-file and at least one manifest are required');
  if (projects.some(file => manifests.includes(file))) {
    throw new Error('a source path cannot be both a manifest and an Xcode project');
  }
  const globalPath = path.posix.join(path.posix.dirname(resolvedPath), 'Package.swift');
  if ([...manifests, ...projects].includes(globalPath)) {
    throw new Error('the generated manifest cannot be a source manifest or Xcode project');
  }

  return {
    root: required('GITHUB_WORKSPACE'),
    pullRequest,
    resolvedPath,
    globalPath,
    sources: [
      ...manifests.map(file => ({ file, format: swiftManifest })),
      ...projects.map(file => ({ file, format: xcodeProject })),
    ],
    watchedPaths: [...manifests, ...projects, globalPath],
    outputPath: required('GITHUB_OUTPUT'),
  };
}

function inputPaths(input: string): string[] {
  return [...new Set(input.split('\n').map(value => value.trim()).filter(Boolean))];
}

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
}
