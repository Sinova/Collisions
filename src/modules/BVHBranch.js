/**
 * @private
 */
const branch_pool = [];

/**
 * A branch within a BVH
 * @class
 * @private
 */
export default class BVHBranch {
	/**
	 * @constructor
	 */
	constructor() {
		/** @private */
		this._bvh_parent = null;

		/** @private */
		this._bvh_branch = true;

		/** @private */
		this._bvh_left = null;

		/** @private */
		this._bvh_right = null;

		/** @private */
		this._bvh_sort = 0;

		/** @private */
		this._bvh_min_x = 0;

		/** @private */
		this._bvh_min_y = 0;

		/** @private */
		this._bvh_max_x = 0;

		/** @private */
		this._bvh_max_y = 0;
	}

	/**
	 * Returns a branch from the branch pool or creates a new branch
	 * @returns {BVHBranch}
	 */
	static getBranch() {
		if(branch_pool.length) {
			return branch_pool.pop();
		}

		return new BVHBranch();
	}

	/**
	 * Releases a branch back into the branch pool
	 * @param {BVHBranch} branch The branch to release
	 */
	static releaseBranch(branch) {
		branch_pool.push(branch);
	}

	/**
	 * Sorting callback used to sort branches by deepest first
	 * @param {BVHBranch} a The first branch
	 * @param {BVHBranch} b The second branch
	 * @returns {Number}
	 */
	static sortBranches(a, b) {
		return a.sort > b.sort ? -1 : 1;
	}
};
