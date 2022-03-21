import type {BVH, FilterPotentials} from './BVH.js';
import type {BVHBranch} from './BVHBranch.js';
import type {Circle} from './Circle.js';
import type {Point} from './Point.js';
import type {Polygon} from './Polygon.js';
import type {CollisionResult} from './CollisionResult.js';
import {SAT} from './SAT.js';

// TODO name? lol
export type SomeBody = Circle | Polygon | Point;

/**
 * The base class for bodies used to detect collisions
 */
export abstract class Body {
	_circle = false;
	_polygon = false;
	_point = false;

	x: number; // The X coordinate of the body
	y: number; // The Y coordinate of the body
	padding: number; // The amount to pad the bounding volume when testing for potential collisions

	readonly _bvh_branch = false as const;
	_bvh: null | BVH = null;
	_bvh_parent: null | BVHBranch = null;
	_bvh_padding: number;
	_bvh_min_x = 0;
	_bvh_min_y = 0;
	_bvh_max_x = 0;
	_bvh_max_y = 0;

	/**
	 * x: The starting X coordinate
	 * y: The starting Y coordinate
	 * padding: The amount to pad the bounding volume when testing for potential collisions
	 */
	constructor(x = 0, y = 0, padding = 0) {
		this.x = x;
		this.y = y;
		this.padding = padding;
		this._bvh_padding = padding;
	}

	/**
	 * Determines if the body is colliding with another body
	 * 		target: The target body to test against
	 * 		result: A `CollisionResult` object on which to store information about the collision
	 * 		aabb: Set to false to skip the AABB test (useful if you use your own potential collision heuristic)
	 */
	collides(target: SomeBody, result: CollisionResult | null = null, aabb = true): boolean {
		return SAT(this as any, target, result, aabb); // TODO type?
	}

	/**
	 * Returns a list of potential collisions
	 */
	potentials(filter?: FilterPotentials, results?: SomeBody[]): SomeBody[] {
		const bvh = this._bvh;

		if (bvh === null) {
			throw new Error('Body does not belong to a collision system');
		}

		return bvh.potentials(this as any, filter, results);
	}

	/**
	 * Removes the body from its current collision system
	 */
	remove(): void {
		const bvh = this._bvh;

		if (bvh) {
			bvh.remove(this as any, false); // TODO type?
		}
	}
}
