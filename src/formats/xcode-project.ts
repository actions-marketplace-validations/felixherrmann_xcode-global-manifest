import type { DependencyFormat } from './document';
import { pbxproj } from './pbxproj';

/** Select each snapshot's format here when another Xcode representation is supported. */
export const xcodeProject: DependencyFormat = {
  read(source, file) {
    if (!file.endsWith('.pbxproj')) {
      throw new Error(`${file}: unsupported Xcode project format; currently only .pbxproj is supported`);
    }
    // JSON must never be mistaken for a project with no remote dependencies.
    if (/^\s*\{\s*("|\})/.test(source)) {
      throw new Error(`${file}: JSON Xcode project format is not supported yet`);
    }
    return pbxproj.read(source, file);
  },
};
