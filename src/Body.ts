import type {BVH} from './BVH.js';
import type {BVHBranch} from './BVHBranch.js';
import type {Circle} from './Circle.js';
import type {Point} from './Point.js';
import type {Polygon} from './Polygon.js';
import {Result} from './Result.js';
import {SAT} from './SAT.js';

// TODO name? lol
export type SomeBody = Circle | Polygon | Point;

/**
 * The base class for bodies used to detect collisions
 * @class
 * @protected
 */
export abstract class Body {
	x: number; // The X coordinate of the body
	y: number; // The Y coordinate of the body
	padding: number; // The amount to pad the bounding volume when testing for potential collisions

	_circle = false;
	_polygon = false;
	_point = false;
	_bvh: null | BVH = null;
	_bvh_parent: null | BVHBranch = null;
	_bvh_branch = false;
	_bvh_padding: number;
	_bvh_min_x = 0;
	_bvh_min_y = 0;
	_bvh_max_x = 0;
	_bvh_max_y = 0;

	/**
	 * @constructor
	 * @param {Number} [x = 0] The starting X coordinate
	 * @param {Number} [y = 0] The starting Y coordinate
	 * @param {Number} [padding = 0] The amount to pad the bounding volume when testing for potential collisions
	 */
	constructor(x = 0, y = 0, padding = 0) {
		this.x = x;
		this.y = y;
		this.padding = padding;
		this._bvh_padding = padding;
	}

	abstract draw(context: CanvasRenderingContext2D): void;

	/**
	 * Determines if the body is colliding with another body
	 * @param {Circle|Polygon|Point} target The target body to test against
	 * @param {Result} [result = null] A Result object on which to store information about the collision
	 * @param {Boolean} [aabb = true] Set to false to skip the AABB test (useful if you use your own potential collision heuristic)
	 * @returns {Boolean}
	 */
	collides(target: SomeBody, result: Result | null = null, aabb = true): boolean {
		return SAT(this as any, target, result, aabb); // TODO type?
	}

	/**
	 * Returns a list of potential collisions
	 * @returns {Array<Body>}
	 */
	potentials(): Body[] {
		const bvh = this._bvh;

		if (bvh === null) {
			throw new Error('Body does not belong to a collision system');
		}

		return bvh.potentials(this);
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

	/**
	 * Creates a {@link Result} used to collect the detailed results of a collision test
	 */
	createResult(): Result {
		return new Result();
	}

	/**
	 * Creates a Result used to collect the detailed results of a collision test
	 */
	static createResult(): Result {
		return new Result();
	}
}
