import {Bvh, type Filter_Potentials} from './Bvh.js';
import {Circle} from './Circle.js';
import {Point} from './Point.js';
import {Polygon} from './Polygon.js';
import type {Collision_Result} from './Collision_Result.js';
import type {Some_Body} from './Body.js';
import {sat} from './sat.js';

/**
 * A collision system used to track bodies in order to improve collision detection performance
 */
export class Collisions {
	_bvh: Bvh;

	constructor() {
		this._bvh = new Bvh();
	}

	/**
	 * Creates a `Circle` and inserts it into the collision system
	 * 		x: The starting X coordinate
	 * 		y: The starting Y coordinate
	 * 		radius
	 * 		scale
	 * 		padding: The amount to pad the bounding volume when testing for potential collisions
	 */
	create_circle(x = 0, y = 0, radius = 0, scale = 1, padding = 0): Circle {
		const body = new Circle(x, y, radius, scale, padding);

		this._bvh.insert(body);

		return body;
	}

	/**
	 * Creates a `Polygon` and inserts it into the collision system
	 * 		x: The starting X coordinate
	 * 		y: The starting Y coordinate
	 * 		points: An array of coordinate pairs making up the polygon - [[x1, y1], [x2, y2], ...]
	 * 		angle: The starting rotation in radians
	 * 		scale_x: The starting scale along the X axis
	 * 		scale_y: The starting scale long the Y axis
	 * 		padding: The amount to pad the bounding volume when testing for potential collisions
	 */
	create_polygon(
		x = 0,
		y = 0,
		points: Array<[number, number]> = [[0, 0]],
		angle = 0,
		scale_x = 1,
		scale_y = 1,
		padding = 0,
	): Polygon {
		const body = new Polygon(x, y, points, angle, scale_x, scale_y, padding);

		this._bvh.insert(body);

		return body;
	}

	/**
	 * Creates a `Point` and inserts it into the collision system
	 * 		x: The starting X coordinate
	 * 		y: The starting Y coordinate
	 * 		padding: The amount to pad the bounding volume when testing for potential collisions
	 */
	create_point(x = 0, y = 0, padding = 0): Point {
		const body = new Point(x, y, padding);

		this._bvh.insert(body);

		return body;
	}

	/**
	 * Inserts bodies into the collision system
	 */
	insert(...bodies: Some_Body[]): Collisions {
		for (const body of bodies) {
			this._bvh.insert(body, false);
		}

		return this;
	}

	/**
	 * Removes bodies from the collision system
	 */
	remove(...bodies: Some_Body[]): Collisions {
		for (const body of bodies) {
			this._bvh.remove(body, false);
		}

		return this;
	}

	/**
	 * Updates the collision system. This should be called before any collisions are tested.
	 */
	update(): Collisions {
		this._bvh.update();

		return this;
	}

	/**
	 * Returns a list of potential collisions for a body
	 * 		body: The body to test for potential collisions against
	 */
	potentials(body: Some_Body, filter?: Filter_Potentials, results?: Some_Body[]): Some_Body[] {
		return this._bvh.potentials(body, filter, results);
	}

	/**
	 * Determines if two bodies are colliding
	 * 		source: The source body
	 * 		target: The target body to test against
	 * 		result: A `Collision_Result` object on which to store information about the collision
	 * 		aabb: Set to false to skip the AABB test (useful if you use your own potential collision heuristic)
	 */
	collides(
		source: Some_Body,
		target: Some_Body,
		result: Collision_Result | null = null,
		aabb = true,
	): boolean {
		return sat(source, target, result, aabb);
	}
}
