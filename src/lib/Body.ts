import type {Bvh, Filter_Potentials} from './Bvh.js';
import type {Bvh_Branch} from './Bvh_Branch.js';
import type {Circle} from './Circle.js';
import type {Point} from './Point.js';
import type {Polygon} from './Polygon.js';
import type {Collision_Result} from './Collision_Result.js';
import {sat} from './sat.js';

// TODO name? lol
export type Some_Body = Circle | Polygon | Point;

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
	_bvh: null | Bvh = null;
	_bvh_parent: null | Bvh_Branch = null;
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
	 * 		result: A `Collision_Result` object on which to store information about the collision
	 * 		aabb: Set to false to skip the AABB test (useful if you use your own potential collision heuristic)
	 */
	collides(target: Some_Body, result: Collision_Result | null = null, aabb = true): boolean {
		return sat(this as any, target, result, aabb); // TODO type?
	}

	/**
	 * Returns a list of potential collisions
	 */
	potentials(filter?: Filter_Potentials, results?: Some_Body[]): Some_Body[] {
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
