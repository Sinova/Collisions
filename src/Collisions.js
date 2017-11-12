// Any lookup or calculation used more than once is assigned to a variable
// https://jsperf.com/array-lookup-vs-const
// https://jsperf.com/duplicate-math-vs-const

import Circle  from './classes/Circle.js';
import Polygon from './classes/Polygon.js';

export default {
	Circle,
	Polygon,
	collides,
};

const tmp_vector = [0, 0];

let aabb1 = null;
let aabb2 = null;

function collides(a, b, out, aabb = true) {
	if(aabb && !aabbAABB(a, b)) {
		return false;
	}

	const a_polygon = a._radius === undefined;
	const b_polygon = b._radius === undefined;

	return (
		a_polygon && b_polygon ? polygonPolygon(a, b, out) :
		a_polygon ? polygonCircle(a, b, out) :
		b_polygon ? circlePolygon(a, b, out) :
		circleCircle(a, b, out)
	);
}

function aabbAABB(a, b, out) {
	const a_x    = a.x;
	const a_y    = a.y;
	const b_x    = b.x;
	const b_y    = b.y;
	const x_diff = b_x - a_x;
	const y_diff = b_y - a_y;
	const a_aabb = a._aabb;
	const b_aabb = b._aabb;

	if(a._dirty_coords) {
		a._calculateCoords();
	}

	if(b._dirty_coords) {
		b._calculateCoords();
	}

	if(
		a._min_x > b._max_x + x_diff ||
		a._min_y > b._max_y + y_diff ||
		a._max_x < b._min_x + x_diff ||
		a._max_y < b._min_y + y_diff
	) {
		return false;
	}

	if(out) {
		if(aabb1 === null) {
			aabb1 = new Polygon(a_x, a_y, a_aabb);
			aabb2 = new Polygon(b_x, b_y, b_aabb);
		}
		else {
			Polygon.call(aabb1, a_x, a_y, a_aabb);
			Polygon.call(aabb2, b_x, b_y, b_aabb);
		}

		polygonPolygon(aabb1, aabb2, out);

		out.a = a;
		out.b = b;
	}

	return true;
}

function polygonPolygon(a, b, out) {
	const a_coords  = a._coords;
	const b_coords  = b._coords;
	const a_normals = a._normals;
	const b_normals = b._normals;
	const a_count   = a_coords.length;
	const b_count   = b_coords.length;

	if(out) {
		out.a         = a;
		out.b         = b;
		out.a_in_b    = true;
		out.b_in_a    = true;
		out.overlap   = a_count === 1 && b_count === 1 ? 0 : Number.MAX_VALUE;
		out.overlap_x = 0;
		out.overlap_y = 0;
	}

	if(a._dirty_axes) {
		a._calculateAxes();
	}
	else if(a._dirty_coords) {
		a._calculateCoords();
	}

	if(b._dirty_axes) {
		b._calculateAxes();
	}
	else if(b._dirty_coords) {
		b._calculateCoords();
	}

	if(a_count > 1) {
		for(const axis of a_normals) {
			if(separatingAxis(a, b, axis, out)) {
				return false;
			}
		}
	}

	if(b_count > 1) {
		for(const axis of b_normals) {
			if(separatingAxis(a, b, axis, out)) {
				return false;
			}
		}
	}

	return true;
}

function polygonCircle(a, b, out) {
	if(a._dirty_axes) {
		a._calculateAxes();
	}
	else if(a._dirty_coords) {
		a._calculateCoords();
	}

	const a_coords       = a._coords;
	const a_edges        = a._edges;
	const a_normals      = a._normals;
	const b_radius       = b._radius;
	const b_radius2      = b_radius * 2;
	const difference_x   = b.x - a.x;
	const difference_y   = b.y - a.y;
	const radius_squared = b_radius * b_radius;
	const count          = a_coords.length;

	let a_in_b    = true;
	let b_in_a    = true;
	let overlap   = Number.MAX_VALUE;
	let overlap_x = null;
	let overlap_y = null;

	for(let i = 0; i < count; i++) {
		const edge    = a_edges[i];
		const edge_x  = edge[0];
		const edge_y  = edge[1];
		const point   = a_coords[i];
		const point_x = difference_x - point[0];
		const point_y = difference_y - point[1];
		const dot     = edge_x * point_x + edge_y * point_y;
		const region  = dot < 0 ? -1 : dot > edge_x * edge_x + edge_y * edge_y ? 1 : 0;

		let tmp_overlap   = null;
		let tmp_overlap_x = null;
		let tmp_overlap_y = null;

		if(out && a_in_b && point_x * point_x + point_y * point_y > radius_squared) {
			a_in_b = false;
		}

		if(region) {
			const left     = region === -1;
			const other    = left ? (i === 0 ? count - 1 : i - 1) : (i === count - 1 ? 0 : i + 1);
			const edge2    = a_edges[other];
			const edge2_x  = edge2[0];
			const edge2_y  = edge2[1];
			const point2   = a_coords[other];
			const point2_x = difference_x - point2[0];
			const point2_y = difference_y - point2[1];
			const dot2     = edge2_x * point2_x + edge2_y * point2_y;
			const region2  = dot2 < 0 ? -1 : dot2 > edge2_x * edge2_x + edge2_y * edge2_y ? 1 : 0;

			if(region2 === -region) {
				const target_x       = left ? point_x : point2_x;
				const target_y       = left ? point_y : point2_y;
				const length_squared = target_x * target_x + target_y * target_y;

				if(length_squared > radius_squared) {
					return false;
				}

				if(out) {
					const length = Math.sqrt(length_squared);

					b_in_a        = false;
					tmp_overlap   = b_radius - length;
					tmp_overlap_x = target_x / length;
					tmp_overlap_y = target_y / length;
				}
			}
		}
		else {
			const normal          = a_normals[i];
			const normal_x        = normal[0];
			const normal_y        = normal[1];
			const length          = point_x * normal_x + point_y * normal_y;
			const absolute_length = length < 0 ? -length : length;

			if(length > 0 && absolute_length > b_radius) {
				return false;
			}

			if(out) {
				tmp_overlap   = b_radius - length;
				tmp_overlap_x = normal_x;
				tmp_overlap_y = normal_y;

				if(b_in_a && length >= 0 || tmp_overlap < b_radius2) {
					b_in_a = false;
				}
			}
		}

		if(out && tmp_overlap !== null && tmp_overlap < overlap) {
			overlap   = tmp_overlap;
			overlap_x = tmp_overlap_x;
			overlap_y = tmp_overlap_y;
		}
	}

	if(out) {
		out.a         = a;
		out.b         = b;
		out.a_in_b    = a_in_b;
		out.b_in_a    = b_in_a;
		out.overlap   = overlap;
		out.overlap_x = overlap_x;
		out.overlap_y = overlap_y;
	}

	return true;
}

function circlePolygon(circle, polygon, out) {
	if(!polygonCircle(polygon, circle, out)) {
		return false;
	}

	if(out) {
		const a      = out.a;
		const a_in_b = out.a_in_b;

		out.a         = out.b;
		out.b         = a;
		out.a_in_b    = out.b_in_a;
		out.b_in_a    = a_in_b;
		out.overlap_x = -out.overlap_x;
		out.overlap_y = -out.overlap_y;
	}

	return true;
}

function circleCircle(a, b, out) {
	const a_radius       = a._radius;
	const b_radius       = b._radius;
	const difference_x   = b.x - a.x;
	const difference_y   = b.y - a.y;
	const radius_sum     = a_radius + b_radius;
	const length_squared = difference_x * difference_x + difference_y * difference_y;

	if(length_squared > radius_sum * radius_sum) {
		return false;
	}

	if(out) {
		const length = Math.sqrt(length_squared);

		out.a         = a;
		out.b         = b;
		out.a_in_b    = a_radius <= b_radius && length <= b_radius - a_radius;
		out.b_in_a    = b_radius <= a_radius && length <= a_radius - b_radius;
		out.overlap   = radius_sum - length;
		out.overlap_x = difference_x / length;
		out.overlap_y = difference_y / length;
	}

	return true;
}

function separatingAxis(a, b, axis, out) {
	const axis_x = axis[0];
	const axis_y = axis[1];
	const offset = (b.x - a.x) * axis_x + (b.y - a.y) * axis_y;

	projectPolygon(a, axis, tmp_vector);

	const a_x = tmp_vector[0];
	const a_y = tmp_vector[1];

	projectPolygon(b, axis, tmp_vector);

	const b_x = tmp_vector[0] + offset;
	const b_y = tmp_vector[1] + offset;

	if(a_x > b_y || b_x > a_y) {
		return true;
	}

	if(out) {
		let overlap = 0;

		if(a_x < b_x) {
			out.a_in_b = false;

			if(a_y < b_y) {
				overlap    = a_y - b_x;
				out.b_in_a = false;
			}
			else {
				const option1 = a_y - b_x;
				const option2 = b_y - a_x;

				overlap = option1 < option2 ? option1 : -option2;
			}
		}
		else {
			out.b_in_a = false;

			if(a_y > b_y) {
				overlap    = a_x - b_y;
				out.a_in_b = false;
			}
			else {
				const option1 = a_y - b_x;
				const option2 = b_y - a_x;

				overlap = option1 < option2 ? option1 : -option2;
			}
		}

		const absolute_overlap = overlap < 0 ? -overlap : overlap;

		if(absolute_overlap < out.overlap) {
			out.overlap   = absolute_overlap;
			out.overlap_x = overlap < 0 ? -axis_x : axis_x;
			out.overlap_y = overlap < 0 ? -axis_y : axis_y;
		}
	}

	return false;
}

function projectPolygon(polygon, axis, out) {
	const coords = polygon._coords;
	const axis_x = axis[0];
	const axis_y = axis[1];

	let min = Number.MAX_VALUE;
	let max = -Number.MAX_VALUE;

	if(polygon._dirty_coords) {
		polygon._calculateCoords();
	}

	for(const point of coords) {
		const dot = point[0] * axis_x + point[1] * axis_y;

		if(dot < min) {
			min = dot;
		}

		if(dot > max) {
			max = dot;
		}
	}

	out[0] = min;
	out[1] = max;
}
