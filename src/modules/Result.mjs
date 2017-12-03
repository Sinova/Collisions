/**
 * An object used to collect the detailed results of a collision test
 *
 * > **Note:** It is highly recommended you recycle the same Result object if possible in order to avoid wasting memory
 * @class
 */
export default class Result {
	/**
	 * @constructor
	 */
	constructor() {
		/**
		 * @desc True if a collision was detected
		 * @type {Boolean}
		 */
		this.collision = false;

		/**
		 * @desc The source body tested
		 * @type {Circle|Polygon|Point}
		 */
		this.a = null;

		/**
		 * @desc The target body tested against
		 * @type {Circle|Polygon|Point}
		 */
		this.b = null;

		/**
		 * @desc True if A is completely contained within B
		 * @type {Boolean}
		 */
		this.a_in_b = false;

		/**
		 * @desc True if B is completely contained within A
		 * @type {Boolean}
		 */
		this.a_in_b = false;

		/**
		 * @desc The magnitude of the shortest axis of overlap
		 * @type {Number}
		 */
		this.overlap = 0;

		/**
		 * @desc The X direction of the shortest axis of overlap
		 * @type {Number}
		 */
		this.overlap_x = 0;

		/**
		 * @desc The Y direction of the shortest axis of overlap
		 * @type {Number}
		 */
		this.overlap_y = 0;
	}
};
