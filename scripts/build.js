/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { execSync } from 'node:child_process';
import { existsSync, cpSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

// npm install if node_modules was removed (e.g. via npm run clean or scripts/clean.js)
if (!existsSync(join(root, 'node_modules'))) {
  execSync('npm install', { stdio: 'inherit', cwd: root });
}

console.log('Building packages...');
execSync('npx tsc --build tsconfig.build.json', {
  stdio: 'inherit',
  cwd: root,
});

// Run post-build steps for each package (copying assets, etc.)
const packages = ['core', 'cli', 'a2a-server', 'test-utils'];
for (const pkg of packages) {
  const pkgDir = join(root, 'packages', pkg);
  if (existsSync(pkgDir)) {
    execSync('node ../../scripts/copy_files.js', {
      stdio: 'inherit',
      cwd: pkgDir,
    });

    if (pkg === 'core') {
      const docsSource = join(root, 'docs');
      const docsTarget = join(pkgDir, 'dist', 'docs');
      if (existsSync(docsSource)) {
        cpSync(docsSource, docsTarget, { recursive: true, dereference: true });
        console.log('Copied documentation to packages/core/dist/docs');
      }
    }
    writeFileSync(join(pkgDir, 'dist', '.last_build'), '');
  }
}

// VS Code companion is build separately as it has its own complex build process
console.log('Building vscode-ide-companion...');
execSync('npm run build --workspace gemini-cli-vscode-ide-companion', {
  stdio: 'inherit',
  cwd: root,
});

// also build container image if sandboxing is enabled
// skip (-s) npm install + build since we did that above
try {
  execSync('node scripts/sandbox_command.js -q', {
    stdio: 'inherit',
    cwd: root,
  });
  if (
    process.env.BUILD_SANDBOX === '1' ||
    process.env.BUILD_SANDBOX === 'true'
  ) {
    execSync('node scripts/build_sandbox.js -s', {
      stdio: 'inherit',
      cwd: root,
    });
  }
} catch {
  // ignore
}
