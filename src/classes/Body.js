import SAT from './SAT.js';

export default class Body {
	/**
	 * Parent class for bodies used to detect collisions
	 * @param {Number} padding The amount to pad the bounding volume when checking for potential collisions
	 * @constructor
	 */
	constructor(padding = 0) {
		this.padding = padding;

		this._bvh          = null;
		this._bvh_parent   = null;
		this._bvh_branch   = false;
		this._bvh_iterated = false;
		this._bvh_padding  = padding;
		this._bvh_min_x    = 0;
		this._bvh_min_y    = 0;
		this._bvh_max_x    = 0;
		this._bvh_max_y    = 0;
	}

	/**
	 *
	 * @param {Body} target The target body to test against
	 * @param {Object} out An object on which to store information about the collision (see SAT.collides for more information)
	 * @param {Boolean} aabb Set to false to skip the AABB check (useful if you use your own potential collision heuristic)
	 * @returns {Boolean}
	 */
	collides(target, out = null, aabb = true) {
		return SAT(this, target, out, aabb);
	}

	/**
	 * Returns a list of potential collisions
	 * @returns {Iterator<Body>}
	 */
	potentials() {
		if(this._bvh === null) {
			throw new Error('Body does not belong to a collision system');
		}

		return this._bvh.potentials(this);
	}
};
