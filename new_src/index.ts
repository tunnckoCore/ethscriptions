// SPDX-License-Identifier: MPL-2.0

import { createSafeClient } from '@orpc/client';
import { client as unsafeClient } from './lib/isomorphic.ts';

export const client = createSafeClient(unsafeClient);

export { client as unsafeClient } from './lib/isomorphic.ts';
