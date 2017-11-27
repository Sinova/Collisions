import Tank   from './examples/Tank.mjs';
import Stress from './examples/Stress.mjs';

let example;

switch(window.location.search) {
	case '?stress':
		example = new Stress();
		break;

	default:
		example = new Tank();
		break;
}

document.body.appendChild(example.element);
