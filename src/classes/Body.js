import SAT from './SAT.js';

export default class Body {
	/**
	 * Parent class for bodies used to detect collisions
	 * @constructor
	 */
	constructor() {
		this._bvh        = null;
		this._bvh_parent = null;
		this._bvh_branch = false;
		this._bvh_sort   = 0;
		this._bvh_min_x  = 0;
		this._bvh_min_y  = 0;
		this._bvh_max_x  = 0;
		this._bvh_max_y  = 0;
	}

	/**
	 *
	 * @param {Body} target The target body to test against
	 * @param {Object} out An object on which to store information about the collision (see SAT.collides for more information)
	 * @param {Boolean} aabb Set to false to skip the AABB check (useful if you use your own potential collision heuristic)
	 * @returns Boolean
	 */
	collides(target, out = null, aabb = true) {
		return SAT(this, target, out, aabb);
	}

	/**
	 * Returns a list of potential collisions
	 * @returns Iterator
	 */
	potentials() {
		if(this._bvh === null) {
			throw new Error('Body does not belong to a collision system');
		}

		return this._bvh.potentials(this);
	}
};
