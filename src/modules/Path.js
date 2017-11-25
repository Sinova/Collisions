import Body    from './Body.js';
import Polygon from './Polygon.js';

/**
 * @private
 */
const polygon_pool = [];

/**
 * A path used to detect collisions
 * @class
 */
export default class Path extends Body {
	/**
	 * @constructor
	 * @param {Number} [x = 0] The starting X coordinate
	 * @param {Number} [y = 0] The starting Y coordinate
	 * @param {Array<Number[]>} [points = []] An array of coordinate pairs making up the path - [[x1, y1], [x2, y2], ...]
	 * @param {Number} [angle = 0] The starting rotation in radians
	 * @param {Number} [scale_x = 1] The starting scale along the X axis
	 * @param {Number} [scale_y = 1] The starting scale long the Y axis
	 * @param {Number} [padding = 0] The amount to pad the bounding volume when testing for potential collisions
	 */
	constructor(x = 0, y = 0, points = [], angle = 0, scale_x = 1, scale_y = 1, padding = 0) {
		super(x, y, padding);

		/**
		 * @desc The angle of the body in radians
		 * @type {Number}
		 */
		this.angle = angle;

		/**
		 * @desc The scale of the body along the X axis
		 * @type {Number}
		 */
		this.scale_x = scale_x;

		/**
		 * @desc The scale of the body along the Y axis
		 * @type {Number}
		 */
		this.scale_y = scale_y;

		/** @private */
		this._path = true;

		/** @private */
		this._polygons = [];

		this.setPoints(points);
	}

	/**
	 * Draws the path to a CanvasRenderingContext2D's current path
	 * @param {CanvasRenderingContext2D} context The context to add the shape to
	 */
	render(context) {
		const polygons = this._polygons;

		for(let i = 0; i < polygons.length; ++i) {
			polygons[i].render(context);
		}
	}

	/**
	 * Sets the points making up the path. It's important to use this function when changing the path's shape to ensure internal data is also updated.
	 * @param {Array<Number[]>} new_points An array of coordinate pairs making up the path - [[x1, y1], [x2, y2], ...]
	 */
	setPoints(new_points) {
		const bvh           = this._bvh;
		const polygons      = this._polygons;
		const polygon_count = polygons.length;
		const count         = new_points.length;

		for(let i = count; i < polygon_count; ++i) {
			if(bvh) {
				bvh.remove(polygons[i]);
			}

			releasePolygon(polygons[i]);
		}

		for(let i = 0; i < count - 1; ++i) {
			const new_point  = new_points[i];
			const next_point = new_points[i + 1];

			let polygon;

			if(count <= polygon_count) {
				polygon = polygons[i];
			}
			else {
				polygon              = getPolygon();
				polygon._parent_path = this;

				polygons.push(polygon);

				if(bvh) {
					bvh.insert(polygon);
				}
			}

			polygon.setPoints([[new_point[0], new_point[1]], [next_point[0], next_point[1]]]);
		}
	}
}


/**
 * Returns a Polygon from the polygon pool or creates a new polygon
 * @private
 * @returns {Polygon}
 */
function getPolygon() {
	if(polygon_pool.length) {
		return polygon_pool.pop();
	}

	return new Polygon();
}

/**
 * Releases a polygon back into the polygon pool
 * @private
 * @param {Polygon} polygon The polygon to release
 */
function releasePolygon(polygon) {
	polygon_pool.push(polygon);
}
