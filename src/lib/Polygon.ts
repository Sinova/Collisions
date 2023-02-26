import {Body} from './Body.js';

/**
 * A polygon used to detect collisions
 */
export class Polygon<TPoint extends boolean = false> extends Body {
	override readonly _polygon = true as const;
	override readonly _circle = false as const;
	override readonly _point: TPoint | false = false as const; // super weird but seems to work?

	angle: number;
	scale_x: number;
	scale_y: number;

	_x: number;
	_y: number;
	_angle: number; // The angle of the body in radians
	_scale_x: number; // The scale of the body along the X axis
	_scale_y: number; // The scale of the body along the Y axis
	_min_x = 0;
	_min_y = 0;
	_max_x = 0;
	_max_y = 0;
	_points: null | Float64Array = null;
	_coords: null | Float64Array = null;
	_edges: null | Float64Array = null;
	_normals: null | Float64Array = null;
	_dirty_coords = true;
	_dirty_normals = true;

	/**
	 * x: The starting X coordinate
	 * y: The starting Y coordinate
	 * points: An array of coordinate pairs making up the polygon - [[x1, y1], [x2, y2], ...]
	 * angle: The starting rotation in radians
	 * scale_x: The starting scale along the X axis
	 * scale_y: The starting scale long the Y axis
	 * padding: The amount to pad the bounding volume when testing for potential collisions
	 */
	constructor(
		x = 0,
		y = 0,
		points: Array<[number, number]> = [],
		angle = 0,
		scale_x = 1,
		scale_y = 1,
		padding = 0,
	) {
		super(x, y, padding);

		this.angle = angle;
		this.scale_x = scale_x;
		this.scale_y = scale_y;

		this._x = x;
		this._y = y;
		this._angle = angle;
		this._scale_x = scale_x;
		this._scale_y = scale_y;

		this.setPoints(points);
	}

	/**
	 * Sets the points making up the polygon. It's important to use this function when changing the polygon's shape to ensure internal data is also updated.
	 * 		new_points: An array of coordinate pairs making up the polygon - [[x1, y1], [x2, y2], ...]
	 */
	setPoints(new_points: Array<[number, number]>): void {
		const count = new_points.length;

		this._points = new Float64Array(count * 2);
		this._coords = new Float64Array(count * 2);
		this._edges = new Float64Array(count * 2);
		this._normals = new Float64Array(count * 2);

		const points = this._points;

		for (let i = 0, ix = 0, iy = 1; i < count; ++i, ix += 2, iy += 2) {
			const new_point = new_points[i];

			points[ix] = new_point[0];
			points[iy] = new_point[1];
		}

		this._dirty_coords = true;
	}

	/**
	 * Calculates and caches the polygon's world coordinates based on its points, angle, and scale
	 */
	_calculateCoords(): void {
		const {x, y, angle, scale_x, scale_y, _points, _coords} = this;
		const count = _points!.length;

		let min_x = 0;
		let max_x = 0;
		let min_y = 0;
		let max_y = 0;

		for (let ix = 0, iy = 1; ix < count; ix += 2, iy += 2) {
			let coord_x = _points![ix] * scale_x;
			let coord_y = _points![iy] * scale_y;

			if (angle) {
				const cos = Math.cos(angle);
				const sin = Math.sin(angle);
				const tmp_x = coord_x;
				const tmp_y = coord_y;

				coord_x = tmp_x * cos - tmp_y * sin;
				coord_y = tmp_x * sin + tmp_y * cos;
			}

			coord_x += x;
			coord_y += y;

			_coords![ix] = coord_x;
			_coords![iy] = coord_y;

			if (ix === 0) {
				min_x = max_x = coord_x;
				min_y = max_y = coord_y;
			} else {
				if (coord_x < min_x) {
					min_x = coord_x;
				} else if (coord_x > max_x) {
					max_x = coord_x;
				}

				if (coord_y < min_y) {
					min_y = coord_y;
				} else if (coord_y > max_y) {
					max_y = coord_y;
				}
			}
		}

		this._x = x;
		this._y = y;
		this._angle = angle;
		this._scale_x = scale_x;
		this._scale_y = scale_y;
		this._min_x = min_x;
		this._min_y = min_y;
		this._max_x = max_x;
		this._max_y = max_y;
		this._dirty_coords = false;
		this._dirty_normals = true;
	}

	/**
	 * Calculates the normals and edges of the polygon's sides
	 */
	_calculateNormals(): void {
		const {_coords, _edges, _normals} = this;
		const count = _coords!.length;

		for (let ix = 0, iy = 1; ix < count; ix += 2, iy += 2) {
			const next = ix + 2 < count ? ix + 2 : 0;
			const x = _coords![next] - _coords![ix];
			const y = _coords![next + 1] - _coords![iy];
			const length = x || y ? Math.sqrt(x * x + y * y) : 0;

			_edges![ix] = x;
			_edges![iy] = y;
			_normals![ix] = length ? y / length : 0;
			_normals![iy] = length ? -x / length : 0;
		}

		this._dirty_normals = false;
	}
}
