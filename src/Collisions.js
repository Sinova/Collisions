import Circle  from './classes/Circle.js';
import Polygon from './classes/Polygon.js';
import BVH     from './classes/BVH.js';
import SAT     from './classes/SAT.js';

export default class Collisions {
	/**
	 * Creates a collision system that tracks bodies to improve collision detection performance
	 * @constructor
	 */
	constructor() {
		const bvh = this._bvh = new BVH();
	}

	/**
	 * Creates a circle used to detect collisions and inserts it into the collision system
	 * @param {Number} x The starting X coordinate
	 * @param {Number} y The starting Y coordinate
	 * @param {Number} radius The radius
	 * @param {Number} scale The scale
	 * @returns Circle
	 */
	createCircle(x = 0, y = 0, radius = 0, scale = 1) {
		const body = new Circle(x, y, radius, scale);

		return (this._bvh.insert(body), body);
	}

	/**
	 * Creates a polygon used to detect collisions and inserts it into the collision system
	 * @param {Number} x The starting X coordinate
	 * @param {Number} y The starting Y coordinate
	 * @param {Array} points An array of coordinate pairs making up the polygon - [[x1, y1], [x2, y2], ...]
	 * @param {Number} angle The starting rotation in radians
	 * @param {Number} scale_x The starting scale along the X axis
	 * @param {Number} scale_y The starting scale long the Y axis
	 * @returns Polygon
	 */
	createPolygon(x = 0, y = 0, points = [], angle = 0, scale_x = 1, scale_y = 1) {
		const body = new Polygon(x, y, points, angle, scale_x, scale_y);

		return (this._bvh.insert(body), body);
	}

	/**
	 * Inserts a body into the collision system
	 * @param {Body} body
	 */
	insert(body) {
		return this._bvh.insert(body, false);
	}

	/**
	 * Removes a body from the collision system
	 * @param {Body} body
	 */
	remove(body) {
		return this._bvh.remove(body, false);
	}

	/**
	 * Updates the collision system
	 * This should be called BEFORE any collisions are checked
	 */
	update() {
		return this._bvh.update();
	}

	/**
	 * Adds lines and arcs representing the bodies within the BVH to a canvas context's current path
	 * @param {CanvasRenderingContext2D} context The context to add lines and arcs to
	 */
	render(context) {
		return this._bvh.render(context, false);
	}

	/**
	 * Returns a list of potential collisions for a body
	 * @param {Body} body The body to test for potential collisions against
	 * @returns Iterator
	 */
	potentials(body) {
		return this._bvh.potentials(body);
	}

	/**
	 *
	 * @param {Body} target The target body to test against
	 * @param {Object} out An object on which to store information about the collision (see SAT.collides for more information)
	 * @param {Boolean} aabb Set to false to skip the AABB check (useful if you use your own potential collision heuristic)
	 * @returns Boolean
	 */
	collides(source, target, out = null, aabb = true) {
		return SAT(source, target, out, aabb);
	}
};

export {
	Collisions,
	Circle,
	Polygon,
	SAT,
};
