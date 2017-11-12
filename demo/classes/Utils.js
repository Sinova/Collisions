export default {
	keyIsDown,
	keyPress,
	random,
	reflect,
	render,
}

function random(min, max) {
	return Math.floor(Math.random() * max) + min;
}

function reflect(vector, normal) {
	const dot    = vector[0] * normal[0] + vector[1] * normal[1];
	const length = normal[0] * normal[0] + normal[1] * normal[1];

	vector[0] = 2 * dot * normal[0] - vector[0];
	vector[1] = 2 * dot * normal[1] - vector[1];
}

function render(context, bodies, player) {
	context.beginPath();

	for(const body of bodies) {
		if(body._radius === undefined) {
			const x      = body.x;
			const y      = body.y;
			const coords = body._coords;

			context.moveTo(x + coords[0][0], y + coords[0][1]);

			for(let i = 1; i < coords.length; ++i) {
				context.lineTo(x + coords[i][0], y + coords[i][1]);
			}

			context.lineTo(x + coords[0][0], y + coords[0][1]);
		}
		else {
			const radius = body.getRadius();

			context.moveTo(body.x + radius, body.y);
			context.arc(body.x, body.y, radius, 0, Math.PI * 2);
		}
	}

	context.fill();
}

// Keyboard
const keys = {};

document.addEventListener('keydown', (e) => {
	keys[e.key] = true;
});

document.addEventListener('keyup', (e) => {
	keys[e.key] = false;
});

function keyIsDown(key) {
	return keys[key];
}

function keyPress(key) {

}
