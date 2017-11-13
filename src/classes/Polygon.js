import Collisions from '../Collisions.js';

export default class Polygon {
	constructor(x = 0, y = 0, points = [], angle = 0) {
		this.x             = x;
		this.y             = y;
		this._angle        = angle;
		this._points       = new Float64Array(0);
		this._coords       = new Float64Array(0);
		this._edges        = new Float64Array(0);
		this._normals      = new Float64Array(0);
		this._min_x        = 0;
		this._min_y        = 0;
		this._max_x        = 0;
		this._max_y        = 0;
		this._dirty_coords = true;
		this._dirty_axes   = true;

		this.setPoints(points);
	}

	collides(target, out) {
		return Collisions.collides(this, target, out);
	}

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
		this._dirty_axes   = true;
	}

	setAngle(angle = 0) {
		this._angle        = angle;
		this._dirty_coords = true;
		this._dirty_axes   = true;
	}

	_calculateCoords() {
		const points = this._points;
		const coords = this._coords;
		const angle  = this._angle;
		const count  = points.length;

		let min_x;
		let max_x;
		let min_y;
		let max_y;

		for(let ix = 0, iy = 1; ix < count; ix += 2, iy += 2) {
			let x = points[ix];
			let y = points[iy];

			if(angle) {
				const cos   = Math.cos(angle);
				const sin   = Math.sin(angle);
				const tmp_x = x;
				const tmp_y = y;

				x = tmp_x * cos - tmp_y * sin;
				y = tmp_x * sin + tmp_y * cos;
			}

			coords[ix] = x;
			coords[iy] = y;

			if(ix === 0) {
				min_x = max_x = x;
				min_y = max_y = y;
			}
			else {
				if(x < min_x) {
					min_x = x;
				}
				else if(x > max_x) {
					max_x = x;
				}

				if(y < min_y) {
					min_y = y;
				}
				else if(y > max_y) {
					max_y = y;
				}
			}
		}

		this._min_x        = min_x;
		this._min_y        = min_y;
		this._max_x        = max_x;
		this._max_y        = max_y;
		this._dirty_coords = false;
	}

	_calculateAxes() {
		const coords  = this._coords;
		const edges   = this._edges;
		const normals = this._normals;
		const count   = coords.length;

		if(this._dirty_coords) {
			this._calculateCoords();
		}

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

		this._dirty_axes = false;
	}
}
