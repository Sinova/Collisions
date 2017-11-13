# Collisions

**Collisions** is a JavaScript implementation of the [Separating Axis Theorem](https://en.wikipedia.org/wiki/Separating_axis_theorem) (SAT) used to detect collisions between Polygons, Circles, Lines, and Points. One common use-case for SAT is in video games and physics simulations.

Demos:

[Movement Demo](https://sinova.github.com/Collisions/demo)

[Stress Test](https://sinova.github.com/Collisions/demo?stress)

# Installation

```bash
npm install collisions
```

# Usage

```JavaScript
import Collisions from 'collisions';

const points = [
	[-20, -40],
	[-10, -70],
	[30, -40],
	[20, 30],
	[-30, 20],
];

const player = new Collisions.Circle(30, 30, 10);
const shape  = new Collisions.Polygon(40, 40, points);
const out    = {};

if(player.collides(shape, out)) {
	console.log(out);
	/*
	Output:
	{
		a         : player,
		b         : shape,
		a_in_b    : true,
		b_in_a    : false,
		overlap   : 24.795908857482157,
		overlap_x : 0.9863939238321437,
		overlap_y : 0.1643989873053573,
	}
	*/
}
```

# API

## Collisions.collides

```JavaScript
Collisions.collides(Object a, Object b[, Object out = null, Boolean aabb = true])
```

<table>
	<tr>
		<th>Type</th>
		<th>Name</th>
		<th>Default</th>
		<th>Description</th>
	</tr>
	<tr>
		<th>Object</th>
		<th>a</th>
		<th></th>
		<td>The source Circle or Polygon to test</td>
	</tr>
	<tr>
		<th>Object</th>
		<th>b</th>
		<th></th>
		<td>The target Circle or Polygon to test against</td>
	</tr>
	<tr>
		<th>Object</th>
		<th>out</th>
		<th>null</th>
		<td>
			An object on which to store information about the collision. It will be populated with the following properties:
			<table>
				<tr>
					<th>a</th>
					<td>The source body tested</td>
				</tr>
				<tr>
					<th>b</th>
					<td>The targe body tested against</td>
				</tr>
				<tr>
					<th>a_in_b</th>
					<td>True if A is completely contained within B</td>
				</tr>
				<tr>
					<th>b_in_a</th>
					<td>True if B is completely contained within A</td>
				</tr>
				<tr>
					<th>overlap</th>
					<td>The magnitude of the shortest axis of overlap (See <a href="#overlap">Overlap</a>)</td>
				</tr>
				<tr>
					<th>overlap_x</th>
					<td>The X direction of the shortest axis of overlap</td>
				</tr>
				<tr>
					<th>overlap_y</th>
					<td>The Y direction of the shortest axis of overlap</td>
				</tr>
			</table>
		</td>
	</tr>
	<tr>
		<th>Boolean</th>
		<th>aabb</th>
		<th>true</th>
		<td>Set to false to skip the inital Axis Aligned Bounding Box (AABB) check. This check is performed to quickly rule out bodies that are too far away for a collision to occur, but some applications may want to use their own heuristic or spatial indexing solution, thus making the AABB check unnecessary.</td>
	</tr>
</table>

## Collisions.Polygon

```JavaScript
new Collisions.Polygon(Number x, Number y, Array points [, Number angle = 0, Number scale_x = 1, Number scale_y = 1])
```

<table>
	<tr>
		<th>Type</th>
		<th>Name</th>
		<th>Default</th>
		<th>Description</th>
	</tr>
	<tr>
		<th>Number</th>
		<th>x</th>
		<th></th>
		<td>The polygon's X coordinate</td>
	</tr>
	<tr>
		<th>Number</th>
		<th>y</th>
		<th></th>
		<td>The polygon's Y coordinate</td>
	</tr>
	<tr>
		<th>Array</th>
		<th>points</th>
		<th></th>
		<td>The polygon's coordinate pairs. Example: <code>[[-20, -40], [-10, -70], [30, -40], [20, 30], [-30, 20]]</code>. Points and Lines can be made by supplying only one or two coordinate pairs, respectively.</td>
	</tr>
	<tr>
		<th>Number</th>
		<th>angle</th>
		<th>0</th>
		<td>The polygon's rotation in radians</td>
	</tr>
	<tr>
		<th>Number</th>
		<th>scale_x</th>
		<th>1</th>
		<td>The polygon's scale along the X axis</td>
	</tr>
	<tr>
		<th>Number</th>
		<th>scale_y</th>
		<th>1</th>
		<td>The polygon's scale along the Y axis</td>
	</tr>
</table>

## Collisions.Circle

```JavaScript
new Collisions.Circle(Number x, Number y, Number radius [, Number scale = 1])
```

<table>
	<tr>
		<th>Type</th>
		<th>Name</th>
		<th>Default</th>
		<th>Description</th>
	</tr>
	<tr>
		<th>Number</th>
		<th>x</th>
		<th></th>
		<td>The circle's X coordinate</td>
	</tr>
	<tr>
		<th>Number</th>
		<th>y</th>
		<th></th>
		<td>The circle's Y coordinate</td>
	</tr>
	<tr>
		<th>Number</th>
		<th>radius</th>
		<th></th>
		<td>The circle's radius</td>
	</tr>
	<tr>
		<th>Number</th>
		<th>scale</th>
		<th>1</th>
		<td>The circle's scale</td>
	</tr>
</table>

<h1 id="overlap">Overlap</h1>

When the **out** parameter is supplied to **Collisions.collides**, three of the properties set on the object are **overlap**, **overlap\_x**, and **overlap\_y**. Together, these values describe how much and in what direction an object is overlapping another object. More specifically, **overlap\_x** and **overlap\_y** make up the direction vector and **overlap** is the magnitude of that vector.

These values can be used to "push" one object out of another using the minimum distance required. Effectively, subtracting this vector from an object's position will cause the objects to no longer collide. Here's a simple example:

```JavaScript
if(player.collides(wall, out)) {
	player.x -= out.overlap * out.overlap_x;
	player.y -= out.overlap * out.overlap_y;
}
```

# Limitations

SAT assumes all tested polygons are convex. Handling concave shapes requires breaking them down into their component convex polygons (Convex Decomposition) and testing them for collisions individually. Check out [poly-decomp.js](https://github.com/schteppe/poly-decomp.js).
