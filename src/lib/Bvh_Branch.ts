import type {Some_Body} from './Body';

const branch_pool: Bvh_Branch[] = [];

/**
 * A branch within a Bvh
 */
export class Bvh_Branch {
	readonly _bvh_branch = true as const;
	_bvh_parent: null | Bvh_Branch = null;
	_bvh_left: null | Bvh_Branch | Some_Body = null;
	_bvh_right: null | Bvh_Branch | Some_Body = null;
	_bvh_sort = 0;
	_bvh_min_x = 0;
	_bvh_min_y = 0;
	_bvh_max_x = 0;
	_bvh_max_y = 0;

	/**
	 * Returns a branch from the branch pool or creates a new branch
	 */
	static getBranch(): Bvh_Branch {
		if (branch_pool.length) {
			return branch_pool.pop()!;
		}

		return new Bvh_Branch();
	}

	/**
	 * Releases a branch back into the branch pool
	 * 		branch: The branch to release
	 */
	static releaseBranch(branch: Bvh_Branch): void {
		branch_pool.push(branch);
	}

	/**
	 * Sorting callback used to sort branches by deepest first
	 * 		a: The first branch
	 * 		b: The second branch
	 */
	static sortBranches(a: Bvh_Branch, b: Bvh_Branch): number {
		return a._bvh_sort > b._bvh_sort ? -1 : 1;
	}
}
