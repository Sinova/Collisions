# Collisions

**Collisions** is a JavaScript implementation of the [Separating Axis Theorem](https://en.wikipedia.org/wiki/Separating_axis_theorem) (SAT) used to detect collisions between Polygons, Circles, Lines, and Points. One common use-case for SAT is in video games and physics simulations.

* [Installation](#installation)
* [Demos](#demos)
* [Usage](#usage)
* [API Documentation](#api-documentation)
	* [Collisions](#collisions-1)
	* [Circle](#circle)
	* [Polygon](#polygon)
	* [Line](#line)
	* [Point](#point)
* [Collision Information](#collision-information)
* [Overlap](#overlap)
* [Limitations](#limitations)
* [Acknowledgements](#acknowledgements)

# Installation

```bash
npm install collisions
```

# Demos:

* [Movement](https://sinova.github.com/Collisions/demo)
* [Stress Test](https://sinova.github.com/Collisions/demo?stress)

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

# API Documentation

## Collisions

```JavaScript
Collisions.collides(Object a, Object b [, Object out = null, Boolean aabb = true])
```

Checks if two bodies are colliding. If an object is passed as the **out** parameter, properties describing the collision are set on it.

<table>
	<tr>
		<th>Type</th>
		<th>Name</th>
		<th>Default</th>
		<th>Description</th>
	</tr>
	<tr>
		<td>Object</td>
		<td>a</td>
		<td></td>
		<td>The source body to test</td>
	</tr>
	<tr>
		<td>Object</td>
		<td>b</td>
		<td></td>
		<td>The target body to test against</td>
	</tr>
	<tr>
		<td>Object</td>
		<td>out</td>
		<td>null</td>
		<td>
			An object on which to store information about the collision (see <a href="#collision-information">Collision Information</a>).
		</td>
	</tr>
	<tr>
		<td>Boolean</td>
		<td>aabb</td>
		<td>true</td>
		<td>Set to false to skip the inital Axis Aligned Bounding Box (AABB) check. This check is performed to quickly rule out bodies that are too far away for a collision to occur, but some applications may want to use their own heuristic or spatial indexing solution, thus making the AABB check unnecessary.</td>
	</tr>
</table>

## Circle

```JavaScript
new Collisions.Circle(Number x, Number y, Number radius [, Number scale = 1])
```

Creates a new Circle body to be used for testing collisions

<table>
	<tr>
		<th>Type</th>
		<th>Name</th>
		<th>Default</th>
		<th>Description</th>
	</tr>
	<tr>
		<td>Number</td>
		<td>x</td>
		<td></td>
		<td>The circle's X coordinate</td>
	</tr>
	<tr>
		<td>Number</td>
		<td>y</td>
		<td></td>
		<td>The circle's Y coordinate</td>
	</tr>
	<tr>
		<td>Number</td>
		<td>radius</td>
		<td></td>
		<td>The circle's radius</td>
	</tr>
	<tr>
		<td>Number</td>
		<td>scale</td>
		<td>1</td>
		<td>The circle's scale</td>
	</tr>
</table>

```JavaScript
Circle.prototype.collides(Object target [, Object out = null, Boolean aabb = true])
```

Returns true if the circle is colliding with the target

<table>
	<tr>
		<th>Type</th>
		<th>Name</th>
		<th>Default</th>
		<th>Description</th>
	</tr>
	<tr>
		<td>Object</td>
		<td>target</td>
		<td></td>
		<td>The target body to test against</td>
	</tr>
	<tr>
		<td>Object</td>
		<td>out</td>
		<td>null</td>
		<td>
			An object on which to store information about the collision (see <a href="#collision-information">Collision Information</a>).
		</td>
	</tr>
	<tr>
		<td>Boolean</td>
		<td>aabb</td>
		<td>true</td>
		<td>Set to false to skip the inital Axis Aligned Bounding Box (AABB) check. This check is performed to quickly rule out bodies that are too far away for a collision to occur, but some applications may want to use their own heuristic or spatial indexing solution, thus making the AABB check unnecessary.</td>
	</tr>
</table>

## Polygon

```JavaScript
new Collisions.Polygon(Number x, Number y, Array points [, Number angle = 0, Number scale_x = 1, Number scale_y = 1])
```

Creates a new Polygon body to be used for testing collisions

<table>
	<tr>
		<th>Type</th>
		<th>Name</th>
		<th>Default</th>
		<th>Description</th>
	</tr>
	<tr>
		<td>Number</td>
		<td>x</td>
		<td></td>
		<td>The polygon's X coordinate</td>
	</tr>
	<tr>
		<td>Number</td>
		<td>y</td>
		<td></td>
		<td>The polygon's Y coordinate</td>
	</tr>
	<tr>
		<td>Array</td>
		<td>points</td>
		<td></td>
		<td>The polygon's coordinate pairs. Example: <code>[[-20, -40], [-10, -70], [30, -40], [20, 30], [-30, 20]]</code>. Points and Lines can be made by supplying only one or two coordinate pairs, respectively.</td>
	</tr>
	<tr>
		<td>Number</td>
		<td>angle</td>
		<td>0</td>
		<td>The polygon's rotation in radians</td>
	</tr>
	<tr>
		<td>Number</td>
		<td>scale_x</td>
		<td>1</td>
		<td>The polygon's scale along the X axis</td>
	</tr>
	<tr>
		<td>Number</td>
		<td>scale_y</td>
		<td>1</td>
		<td>The polygon's scale along the Y axis</td>
	</tr>
</table>

```JavaScript
Polygon.prototype.collides(Object target [, Object out = null, Boolean aabb = true])
```

Returns true if the polygon is colliding with the target

<table>
	<tr>
		<th>Type</th>
		<th>Name</th>
		<th>Default</th>
		<th>Description</th>
	</tr>
	<tr>
		<td>Object</td>
		<td>target</td>
		<td></td>
		<td>The target body to test against</td>
	</tr>
	<tr>
		<td>Object</td>
		<td>out</td>
		<td>null</td>
		<td>
			An object on which to store information about the collision (see <a href="#collision-information">Collision Information</a>).
		</td>
	</tr>
	<tr>
		<td>Boolean</td>
		<td>aabb</td>
		<td>true</td>
		<td>Set to false to skip the inital Axis Aligned Bounding Box (AABB) check. This check is performed to quickly rule out bodies that are too far away for a collision to occur, but some applications may want to use their own heuristic or spatial indexing solution, thus making the AABB check unnecessary.</td>
	</tr>
</table>

```JavaScript
Polygon.prototype.setPoints(Array points)
```

<table>
	<tr>
		<th>Type</th>
		<th>Name</th>
		<th>Default</th>
		<th>Description</th>
	</tr>
	<tr>
		<td>Array</td>
		<td>points</td>
		<td></td>
		<td>An array of coordinate pairs [[0, 0], [100, 100], ...] that make up the polygon</td>
	</tr>
</table>

## Line

Lines can be constructed by creating a polygon with only two coordinate pairs

## Point

Points can be constructed by creating a polygon with only one coordinate pair

# Collision Information

All collision testing functions accept an **out** parameter. If an object is passed as the **out** parameter, properties will be set on the object describing the collision (if one occurs). The following properties are set:

<table>
	<tr>
		<th>Type</th>
		<th>Name</th>
		<th>Description</th>
	</tr>
	<td>
		<td>Object</td>
		<td>a</td>
		<td>The source body tested</td>
	</tr>
	<td>
		<td>Object</td>
		<td>b</td>
		<td>The targe body tested against</td>
	</tr>
	<td>
		<td>Boolean</td>
		<td>a_in_b</td>
		<td>True if A is completely contained within B</td>
	</tr>
	<td>
		<td>Boolean</td>
		<td>b_in_a</td>
		<td>True if B is completely contained within A</td>
	</tr>
	<td>
		<td>Number</td>
		<td>overlap</td>
		<td>The magnitude of the shortest axis of overlap (see <a href="#overlap">Overlap</a>)</td>
	</tr>
	<td>
		<td>Number</td>
		<td>overlap_x</td>
		<td>The X direction of the shortest axis of overlap</td>
	</tr>
	<td>
		<td>Number</td>
		<td>overlap_y</td>
		<td>The Y direction of the shortest axis of overlap</td>
	</tr>
</table>

# Overlap

When the **out** parameter is supplied to a collision testing function, three of the properties set on the object are **overlap**, **overlap\_x**, and **overlap\_y**. Together, these values describe how much and in what direction an object is overlapping another object. More specifically, **overlap\_x** and **overlap\_y** make up the direction vector and **overlap** is the magnitude of that vector.

These values can be used to "push" one object out of another using the minimum distance required. Effectively, subtracting this vector from an object's position will cause the objects to no longer collide. Here's a simple example:

```JavaScript
if(Collisions.collides(player, wall, out)) {
	player.x -= out.overlap * out.overlap_x;
	player.y -= out.overlap * out.overlap_y;
}
```

# Limitations

SAT assumes all tested polygons are convex. Handling concave shapes requires breaking them down into their component convex polygons (Convex Decomposition) and testing them for collisions individually. Check out [poly-decomp.js](https://github.com/schteppe/poly-decomp.js).

# Acknowledgements

This library is heavily based on [SAT.js](https://github.com/jriecken/sat-js), which was an invaluable guide to understanding the SAT algorithm and its implementation.
