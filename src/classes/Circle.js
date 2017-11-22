import Body from './Body.js';

export default class Circle extends Body {
	constructor(x = 0, y = 0, radius = 0, scale = 1) {
		super();

		this.x       = x;
		this.y       = y;
		this.radius  = radius;
		this.scale   = scale;

		this._polygon = false;
	}

	render(context) {
		const x      = this.x;
		const y      = this.y;
		const radius = this.radius * this.scale;

		context.moveTo(x + radius, y);
		context.arc(x, y, radius, 0, Math.PI * 2);
	}
};
