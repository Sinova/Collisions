import Body    from './classes/Body.js';
import Circle  from './classes/Circle.js';
import Polygon from './classes/Polygon.js';
import BVH from './classes/BVH.js';

const collides = Body.collides;

export default {
	Circle,
	Polygon,
	BVH,
	collides,
};
