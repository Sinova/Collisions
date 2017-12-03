import BVH     from './modules/BVH.mjs';
import Circle  from './modules/Circle.mjs';
import Polygon from './modules/Polygon.mjs';
import Point   from './modules/Point.mjs';
import Result  from './modules/Result.mjs';
import SAT     from './modules/SAT.mjs';

/**
 * A collision system used to track bodies in order to improve collision detection performance
 * @class
 */
class Collisions {
	/**
	 * @constructor
	 */
	constructor() {
		/** @private */
		this._bvh = new BVH();
	}

	/**
	 * Creates a {@link Circle} and inserts it into the collision system
	 * @param {Number} [x = 0] The starting X coordinate
	 * @param {Number} [y = 0] The starting Y coordinate
	 * @param {Number} [radius = 0] The radius
	 * @param {Number} [scale = 1] The scale
	 * @param {Number} [padding = 0] The amount to pad the bounding volume when testing for potential collisions
	 * @returns {Circle}
	 */
	createCircle(x = 0, y = 0, radius = 0, scale = 1, padding = 0) {
		const body = new Circle(x, y, radius, scale, padding);

		this._bvh.insert(body);

		return body;
	}

	/**
	 * Creates a {@link Polygon} and inserts it into the collision system
	 * @param {Number} [x = 0] The starting X coordinate
	 * @param {Number} [y = 0] The starting Y coordinate
	 * @param {Array<Number[]>} [points = []] An array of coordinate pairs making up the polygon - [[x1, y1], [x2, y2], ...]
	 * @param {Number} [angle = 0] The starting rotation in radians
	 * @param {Number} [scale_x = 1] The starting scale along the X axis
	 * @param {Number} [scale_y = 1] The starting scale long the Y axis
	 * @param {Number} [padding = 0] The amount to pad the bounding volume when testing for potential collisions
	 * @returns {Polygon}
	 */
	createPolygon(x = 0, y = 0, points = [[0, 0]], angle = 0, scale_x = 1, scale_y = 1, padding = 0) {
		const body = new Polygon(x, y, points, angle, scale_x, scale_y, padding);

		this._bvh.insert(body);

		return body;
	}

	/**
	 * Creates a {@link Point} and inserts it into the collision system
	 * @param {Number} [x = 0] The starting X coordinate
	 * @param {Number} [y = 0] The starting Y coordinate
	 * @param {Number} [padding = 0] The amount to pad the bounding volume when testing for potential collisions
	 * @returns {Point}
	 */
	createPoint(x = 0, y = 0, padding = 0) {
		const body = new Point(x, y, padding);

		this._bvh.insert(body);

		return body;
	}

	/**
	 * Creates a {@link Result} used to collect the detailed results of a collision test
	 */
	createResult() {
		return new Result();
	}

	/**
	 * Creates a Result used to collect the detailed results of a collision test
	 */
	static createResult() {
		return new Result();
	}

	/**
	 * Inserts bodies into the collision system
	 * @param {...Circle|...Polygon|...Point} bodies
	 */
	insert(...bodies) {
		for(const body of bodies) {
			this._bvh.insert(body, false);
		}

		return this;
	}

	/**
	 * Removes bodies from the collision system
	 * @param {...Circle|...Polygon|...Point} bodies
	 */
	remove(...bodies) {
		for(const body of bodies) {
			this._bvh.remove(body, false);
		}

		return this;
	}

	/**
	 * Updates the collision system. This should be called before any collisions are tested.
	 */
	update() {
		this._bvh.update();

		return this;
	}

	/**
	 * Draws the bodies within the system to a CanvasRenderingContext2D's current path
	 * @param {CanvasRenderingContext2D} context The context to draw to
	 */
	draw(context) {
		return this._bvh.draw(context);
	}

	/**
	 * Draws the system's BVH to a CanvasRenderingContext2D's current path. This is useful for testing out different padding values for bodies.
	 * @param {CanvasRenderingContext2D} context The context to draw to
	 */
	drawBVH(context) {
		return this._bvh.drawBVH(context);
	}

	/**
	 * Returns a list of potential collisions for a body
	 * @param {Circle|Polygon|Point} body The body to test for potential collisions against
	 * @returns {Array<Body>}
	 */
	potentials(body) {
		return this._bvh.potentials(body);
	}

	/**
	 * Determines if two bodies are colliding
	 * @param {Circle|Polygon|Point} target The target body to test against
	 * @param {Result} [result = null] A Result object on which to store information about the collision
	 * @param {Boolean} [aabb = true] Set to false to skip the AABB test (useful if you use your own potential collision heuristic)
	 * @returns {Boolean}
	 */
	collides(source, target, result = null, aabb = true) {
		return SAT(source, target, result, aabb);
	}
};

export {
	Collisions as default,
	Collisions,
	Result,
	Circle,
	Polygon,
	Point,
};
