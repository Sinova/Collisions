import Body from './Body.js';

export default class Polygon extends Body {
	/**
	 * Creates a polygon used to detect collisions
	 * @param {Number} x The starting X coordinate
	 * @param {Number} y The starting Y coordinate
	 * @param {...[Number, Number]} points An array of coordinate pairs making up the polygon - [[x1, y1], [x2, y2], ...]
	 * @param {Number} angle The starting rotation in radians
	 * @param {Number} scale_x The starting scale along the X axis
	 * @param {Number} scale_y The starting scale long the Y axis
	 * @param {Number} padding The amount to pad the bounding volume when checking for potential collisions
	 * @constructor
	 */
	constructor(x = 0, y = 0, points = [], angle = 0, scale_x = 1, scale_y = 1, padding = 0) {
		super(padding);

		this.x       = x;
		this.y       = y;
		this.angle   = angle;
		this.scale_x = scale_x;
		this.scale_y = scale_y;

		this._polygon       = true;
		this._x             = x;
		this._y             = y;
		this._angle         = angle;
		this._scale_x       = scale_x;
		this._scale_y       = scale_y;
		this._min_x         = 0;
		this._min_y         = 0;
		this._max_x         = 0;
		this._max_y         = 0;
		this._points        = new Float64Array(0);
		this._coords        = new Float64Array(0);
		this._edges         = new Float64Array(0);
		this._normals       = new Float64Array(0);
		this._dirty_coords  = true;
		this._dirty_normals = true;

		this.setPoints(points);
	}

	/**
	 * Adds lines representing the polygon to a canvas context's current path
	 * @param {CanvasRenderingContext2D} context The context to add the shape to
	 */
	render(context) {
		if(
			this._dirty_coords ||
			this.x !== this._x ||
			this.y !== this._y ||
			this.angle !== this._angle ||
			this.scale_x !== this._scale_x ||
			this.scale_y !== this._scale_y
		) {
			this._calculateCoords();
		}

		const coords = this._coords;

		if(coords.length === 2) {
			context.moveTo(coords[0], coords[1]);
			context.arc(coords[0], coords[1], 1, 0, Math.PI * 2);
		}
		else if(coords.length === 4) {
			context.moveTo(coords[0], coords[1]);
			context.lineTo(coords[2], coords[3]);
		}
		else {
			context.moveTo(coords[0], coords[1]);

			for(let i = 2; i < coords.length; i += 2) {
				context.lineTo(coords[i], coords[i + 1]);
			}

			context.lineTo(coords[0], coords[1]);
		}
	}

	/**
	 * Sets the points that make up the polygon
	 * It's important to use this function when changing the polygon's shape to ensure internal data is also updated.
	 * @param {...[Number, Number]} new_points An array of coordinate pairs making up the polygon - [[x1, y1], [x2, y2], ...]
	 */
	setPoints(new_points) {
		const count = new_points.length;

		this._points  = new Float64Array(count * 2);
		this._coords  = new Float64Array(count * 2);
		this._edges   = new Float64Array(count * 2);
		this._normals = new Float64Array(count * 2);

		const points = this._points;

		for(let i = 0, ix = 0, iy = 1; i < count; ++i, ix += 2, iy += 2) {
			const new_point = new_points[i];

			points[ix] = new_point[0];
			points[iy] = new_point[1];
		}

		this._dirty_coords = true;
	}

	/**
	 * Calculates and caches the polygon's world coordinates based on its points, angle, and scale
	 */
	_calculateCoords() {
		const x       = this.x;
		const y       = this.y;
		const angle   = this.angle;
		const scale_x = this.scale_x;
		const scale_y = this.scale_y;
		const points  = this._points;
		const coords  = this._coords;
		const count   = points.length;

		let min_x;
		let max_x;
		let min_y;
		let max_y;

		for(let ix = 0, iy = 1; ix < count; ix += 2, iy += 2) {
			let coord_x = points[ix] * scale_x;
			let coord_y = points[iy] * scale_y;

			if(angle) {
				const cos   = Math.cos(angle);
				const sin   = Math.sin(angle);
				const tmp_x = coord_x;
				const tmp_y = coord_y;

				coord_x = tmp_x * cos - tmp_y * sin;
				coord_y = tmp_x * sin + tmp_y * cos;
			}

			coord_x += x;
			coord_y += y;

			coords[ix] = coord_x;
			coords[iy] = coord_y;

			if(ix === 0) {
				min_x = max_x = coord_x;
				min_y = max_y = coord_y;
			}
			else {
				if(coord_x < min_x) {
					min_x = coord_x;
				}
				else if(coord_x > max_x) {
					max_x = coord_x;
				}

				if(coord_y < min_y) {
					min_y = coord_y;
				}
				else if(coord_y > max_y) {
					max_y = coord_y;
				}
			}
		}

		this._x             = x;
		this._y             = y;
		this._angle         = angle;
		this._scale_x       = scale_x;
		this._scale_y       = scale_y;
		this._min_x         = min_x;
		this._min_y         = min_y;
		this._max_x         = max_x;
		this._max_y         = max_y;
		this._dirty_coords  = false;
		this._dirty_normals = true;
	}

	/**
	 * Calculates the normals and edges of the polygon's sides
	 */
	_calculateNormals() {
		const coords  = this._coords;
		const edges   = this._edges;
		const normals = this._normals;
		const count   = coords.length;

		for(let ix = 0, iy = 1; ix < count; ix += 2, iy += 2) {
			const next   = ix + 2 < count ? ix + 2 : 0;
			const x      = coords[next] - coords[ix];
			const y      = coords[next + 1] - coords[iy];
			const length = x || y ? Math.sqrt(x * x + y * y) : 0;

			edges[ix]   = x;
			edges[iy]   = y;
			normals[ix] = length ? y / length : 0;
			normals[iy] = length ? -x / length : 0;
		}

		this._dirty_normals = false;
	}
};
