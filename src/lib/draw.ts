import type {Some_Body} from './Body';
import type {Bvh} from './Bvh';
import type {Bvh_Branch} from './Bvh_Branch';
import type {Circle} from './Circle';
import type {Polygon} from './Polygon';

/**
 * Draws the bodies within the Bvh to a CanvasRenderingContext2D's current path
 * @param bodies
 * @param ctx
 */
export const draw_bodies = (bodies: Iterable<Some_Body>, ctx: CanvasRenderingContext2D): void => {
	for (const body of bodies) {
		if (body._circle) {
			draw_circle(body, ctx);
		} else {
			draw_polygon(body, ctx);
		}
	}
};

/**
 * Draws the circle to a CanvasRenderingContext2D's current path
 * @param body
 * @param ctx
 */
export const draw_circle = (body: Circle, ctx: CanvasRenderingContext2D): void => {
	const {x, y} = body;
	const radius = body.radius * body.scale;

	ctx.moveTo(x + radius, y);
	ctx.arc(x, y, radius, 0, Math.PI * 2);
};

/**
 * Draws the polygon to a CanvasRenderingContext2D's current path
 * @param body
 * @param ctx
 */
export const draw_polygon = (body: Polygon<boolean>, ctx: CanvasRenderingContext2D): void => {
	if (
		body._dirty_coords ||
		body.x !== body._x ||
		body.y !== body._y ||
		body.angle !== body._angle ||
		body.scale_x !== body._scale_x ||
		body.scale_y !== body._scale_y
	) {
		body._calculate_coords();
	}

	const coords = body._coords!;

	if (coords.length === 2) {
		ctx.moveTo(coords[0], coords[1]);
		ctx.arc(coords[0], coords[1], 1, 0, Math.PI * 2);
	} else {
		ctx.moveTo(coords[0], coords[1]);

		for (let i = 2; i < coords.length; i += 2) {
			ctx.lineTo(coords[i], coords[i + 1]);
		}

		if (coords.length > 4) {
			ctx.lineTo(coords[0], coords[1]);
		}
	}
};

/**
 * Draws the Bvh to a CanvasRenderingContext2D's current path.
 * This is useful for testing out different padding values for bodies.
 * @param bvh
 * @param ctx
 */
export const draw_bvh = (bvh: Bvh, ctx: CanvasRenderingContext2D): void => {
	let current: Bvh_Branch | Some_Body | null = bvh._hierarchy;
	let traverse_left = true;

	while (current) {
		if (traverse_left) {
			traverse_left = false;

			let left = current._bvh_branch ? current._bvh_left : null;

			while (left) {
				current = left;
				left = current._bvh_branch ? current._bvh_left : null;
			}
		}

		const branch: boolean = current._bvh_branch;
		const min_x = current._bvh_min_x;
		const min_y = current._bvh_min_y;
		const max_x = current._bvh_max_x;
		const max_y = current._bvh_max_y;
		const right: any = branch ? (current as Bvh_Branch)._bvh_right : null;

		ctx.moveTo(min_x, min_y);
		ctx.lineTo(max_x, min_y);
		ctx.lineTo(max_x, max_y);
		ctx.lineTo(min_x, max_y);
		ctx.lineTo(min_x, min_y);

		if (right) {
			current = right;
			traverse_left = true;
		} else {
			let parent = current._bvh_parent!;

			if (parent) {
				while (parent && parent._bvh_right === current) {
					current = parent;
					parent = current._bvh_parent!;
				}

				current = parent;
			} else {
				break;
			}
		}
	}
};
