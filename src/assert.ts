import type {SomeBody} from './Body.js';
import type {BVHBranch} from './BVHBranch.js';
import type {Polygon} from './Polygon.js';

// no-ops for now
// TODO strip for prod builds

export const assertBVHBranch: (a: any) => asserts a is BVHBranch = (_) => {};

export const assertPolygon: (a: SomeBody) => asserts a is Polygon = (_) => {};
