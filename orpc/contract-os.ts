import { implement } from '@orpc/server';
import { contract } from './contract.ts';

// NOTE: used in `./procedures` individual procedure files.
export const os = implement(contract).$context<{ headers: Headers }>();
