import Movement from './examples/Movement.js';
import Stress from './examples/Stress.js';

let example;

switch(window.location.search) {
	case '?stress':
		example = new Stress();
		break;

	default:
		example = new Movement();
		break;
}

document.body.appendChild(example.element);
