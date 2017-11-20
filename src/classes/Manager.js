export default class Manager {
	constructor() {
		this._tree = null;
	}

	collides(a, b) {

	}

	add(body) {
		const radius  = body.radius;
		const polygon = radius === undefined;

		const current = {
			body,
			parent : null,
			_min_x : 0,
			_min_y : 0,
			_max_x : 0,
			_max_y : 0,
		};

		const current_x     = body.x;
		const current_y     = body.y;
		const current_min_x = current._min_x = current_x + (polygon ? body._min_x : -radius) - 0;
		const current_min_y = current._min_y = current_y + (polygon ? body._min_y : -radius) - 0;
		const current_max_x = current._max_x = current_x + (polygon ? body._max_x : radius) + 0;
		const current_max_y = current._max_y = current_y + (polygon ? body._max_y : radius) + 0;

		current.body = body;

		let parent = this._tree;

		if(!parent) {
			this._tree = current;
		}
		else {
			while(true) {
				// Branch
				if(!parent.body) {
					const left_node        = parent.left;
					const left_min_x       = left_node._min_x;
					const left_min_y       = left_node._min_y;
					const left_max_x       = left_node._max_x;
					const left_max_y       = left_node._max_y;
					const left_new_min_x   = current_min_x < left_min_x ? current_min_x : left_min_x;
					const left_new_min_y   = current_min_y < left_min_y ? current_min_y : left_min_y;
					const left_new_max_x   = current_max_x > left_max_x ? current_max_x : left_max_x;
					const left_new_max_y   = current_max_y > left_max_y ? current_max_y : left_max_y;
					const left_volume      = (left_max_x - left_min_x) * (left_max_y - left_min_y);
					const left_new_volume  = (left_new_max_x - left_new_min_x) * (left_new_max_y - left_new_min_y);
					const left_difference  = left_new_volume - left_volume;

					const right_node       = parent.right;
					const right_min_x      = right_node._min_x;
					const right_min_y      = right_node._min_y;
					const right_max_x      = right_node._max_x;
					const right_max_y      = right_node._max_y;
					const right_new_min_x  = current_min_x < right_min_x ? current_min_x : right_min_x;
					const right_new_min_y  = current_min_y < right_min_y ? current_min_y : right_min_y;
					const right_new_max_x  = current_max_x > right_max_x ? current_max_x : right_max_x;
					const right_new_max_y  = current_max_y > right_max_y ? current_max_y : right_max_y;
					const right_volume     = (right_max_x - right_min_x) * (right_max_y - right_min_y);
					const right_new_volume = (right_new_max_x - right_new_min_x) * (right_new_max_y - right_new_min_y);
					const right_difference = right_new_volume - right_volume;

					parent._min_x = left_new_min_x < right_new_min_x ? left_new_min_x : right_new_min_x;
					parent._min_y = left_new_min_y < right_new_min_y ? left_new_min_y : right_new_min_y;
					parent._max_x = left_new_max_x > right_new_max_x ? left_new_max_x : right_new_max_x;
					parent._max_y = left_new_max_y > right_new_max_y ? left_new_max_y : right_new_max_y;

					parent = left_difference <= right_difference ? left_node : right_node;
				}
				// Leaf
				else {
					const grandparent  = parent.parent;
					const parent_min_x = parent._min_x;
					const parent_min_y = parent._min_y;
					const parent_max_x = parent._max_x;
					const parent_max_y = parent._max_y;

					const new_parent = parent.parent = current.parent = {
						parent : parent.parent,
						left   : parent,
						right  : current,
						_min_x : current_min_x < parent_min_x ? current_min_x : parent_min_x,
						_min_y : current_min_y < parent_min_y ? current_min_y : parent_min_y,
						_max_x : current_max_x > parent_max_x ? current_max_x : parent_max_x,
						_max_y : current_max_y > parent_max_y ? current_max_y : parent_max_y,
					};

					if(!grandparent) {
						this._tree = new_parent;
					}
					else if(grandparent.left === parent) {
						grandparent.left = new_parent;
					}
					else {
						grandparent.right = new_parent;
					}

					break;
				}
			}
		}
	}
}
