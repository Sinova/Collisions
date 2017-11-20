import Body    from './classes/Body.js';
import Circle  from './classes/Circle.js';
import Polygon from './classes/Polygon.js';
import Manager from './classes/Manager.js';

const collides = Body.collides;

export default {
	Circle,
	Polygon,
	Manager,
	collides,
};
