/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  'packages/a2a-server/vitest.config.ts',
  'packages/cli/vitest.config.ts',
  'packages/core/vitest.config.ts',
  'packages/test-utils/vitest.config.ts',
  'scripts/tests/vitest.config.ts',
]);
