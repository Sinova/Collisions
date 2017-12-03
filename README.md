Collisions
===============================================================================

**Collisions** is a JavaScript library for quickly and accurately detecting collisions between Polygons, Circles, and Points. It combines the efficiency of a [Bounding Volume Hierarchy](https://en.wikipedia.org/wiki/Bounding_volume_hierarchy) (BVH) for broad-phase searching and the accuracy of the [Separating Axis Theorem](https://en.wikipedia.org/wiki/Separating_axis_theorem) (SAT) for narrow-phase collision testing.

* [Installation](#anchor-installation)
* [Documentation](#anchor-documentation)
* [Demos](#anchor-demos)
* [Usage](#anchor-usage)
* [Getting Started](#anchor-getting-started)
	1. [Creating a Collision System](#anchor-step-1)
	2. [Creating, Inserting, Updating, and Removing Bodies](#anchor-step-2)
	3. [Updating the Collision System](#anchor-step-3)
	4. [Testing for Collisions](#anchor-step-4)
	5. [Getting Detailed Collision Information](#anchor-step-5)
	6. [Negating Overlap](#anchor-step-6)
* [Lines](#anchor-lines)
* [Concave Polygons](#anchor-concave-polygons)
* [Rendering](#anchor-rendering)
* [Bounding Volume Padding](#anchor-bounding-volume-padding)
* [Only using SAT](#anchor-only-using-sat)
* [FAQ](#anchor-faq)

<a name="anchor-installation"></a>
Installation
===============================================================================

```bash
npm install collisions
```

> **Note:** This library uses the native ECMAScript Module syntax. Most environments support native modules, but the following exceptions apply:
>
> * Node.js (9.2.0) requires the [--experimental-modules](https://nodejs.org/api/esm.html) flag
> * Firefox (54) requires the [dom.moduleScripts.enabled](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import#Browser_compatibility) setting
>
> Bundling solutions such as [Webpack](https://webpack.js.org/) or [Rollup.js](https://rollupjs.org/) make native modules compatible with all environments.

<a name="anchor-documentation"></a>
Documentation
===============================================================================

View the [documentation](https://sinova.github.com/Collisions/) (this README is also there).

<a name="anchor-demos"></a>
Demos
===============================================================================

* [Tank](https://sinova.github.com/Collisions/demo/)
* [Stress Test](https://sinova.github.com/Collisions/demo/?stress)

<a name="anchor-usage"></a>
Usage
===============================================================================

```JavaScript
import Collisions from 'collisions';

// Create the collision system
const system = new Collisions();

// Create a Result object for collecting information about the collisions
const result = system.createResult();

// Create the player (represented by a Circle)
const player = system.createCircle(100, 100, 10);

// Create some walls (represented by Polygons)
const wall1 = system.createPolygon(400, 500, [[-60, -20], [60, -20], [60, 20], [-60, 20]], 1.7);
const wall2 = system.createPolygon(200, 100, [[-60, -20], [60, -20], [60, 20], [-60, 20]], 2.2);
const wall3 = system.createPolygon(400, 50, [[-60, -20], [60, -20], [60, 20], [-60, 20]], 0.7);

// Update the collision system
system.update();

// Get any potential collisions (this quickly rules out walls that have no chance of colliding with the player)
const potentials = player.potentials();

// Loop through the potential wall collisions
for(const wall of potentials) {
	// Test if the player collides with the wall
	if(player.collides(wall, result)) {
		// Push the player out of the wall
		player.x -= result.overlap * result.overlap_x;
		player.y -= result.overlap * result.overlap_y;
	}
}
```

<a name="anchor-getting-started"></a>
Getting Started
===============================================================================

<a name="anchor-step-1"></a>
## 1. Creating a Collision System

**Collisions** provides functions for performing both broad-phase and narrow-phase collision tests. In order to take full advantage of both phases, bodies need to be tracked within a collision system.

Call the Collisions constructor to create a collision system.

```JavaScript
import Collisions from 'collisions';

const system = new Collisions();
```

<a name="anchor-step-2"></a>
## 2. Creating, Inserting, Updating, and Removing Bodies

**Collisions** supports the following body types:

* **Circle:** A shape with infinite sides equidistant from a single point
* **Polygon:** A shape made up of line segments
* **Point:** A single coordinate

To use them, import the desired body class, call its constructor, and insert it into the collision system using `insert()`.

```JavaScript
import {Collisions, Circle, Polygon, Point} from 'collisions';

const system = new Collisions();

const circle  = new Circle(100, 100, 10);
const polygon = new Polygon(50, 50, [[0, 0], [20, 20], [-10, 10]]);
const line    = new Polygon(200, 5, [[-30, 0], [10, 20]]);
const point   = new Point(10, 10);

system.insert(circle)
system.insert(polygon, line, point);
```

Collision systems expose several convenience functions for creating bodies and inserting them into the system in one step. This also avoids having to import the different body classes.

```JavaScript
import Collisions from 'collisions';

const system = new Collisions();

const circle  = system.createCircle(100, 100, 10);
const polygon = system.createPolygon(50, 50, [[0, 0], [20, 20], [-10, 10]]);
const line    = system.createPolygon(200, 5, [[-30, 0], [10, 20]]);
const point   = system.createPoint(10, 10);
```

All bodies have `x` and `y` properties that can be manipulated. Additionally, `Circle` bodies have a `scale` property that can be used to scale their overall size. `Polygon` bodies have `scale_x` and `scale_y` properties to scale their points along a particular axis and an `angle` property to rotate their points around their current position (using radians).

```JavaScript
circle.x     = 20;
circle.y     = 30;
circle.scale = 1.5;

polygon.x       = 40;
polygon.y       = 100;
polygon.scale_x = 1.2;
polygon.scale_y = 3.4;
polygon.angle   = 1.2;
```

And, of course, bodies can be removed when they are no longer needed.

```JavaScript
system.remove(polygon, point);
circle.remove();
```

<a name="anchor-step-3"></a>
## 3. Updating the Collision System

Collision systems need to be updated when the bodies within them change. This includes when bodies are inserted, removed, or when their properties change (e.g. position, angle, scaling, etc.). Updating a collision system is done by calling `update()` and should typically occur once per frame.

```JavaScript
system.update();
```

The optimal time for updating a collision system is **after** its bodies have changed and **before** collisions are tested. For example, a game loop might use the following order of events:

```JavaScript
function gameLoop() {
	handleInput();
	processGameLogic();

	system.update();

	handleCollisions();
	render();
}
```

<a name="anchor-step-4"></a>
## 4. Testing for Collisions

When testing for collisions on a body, it is generally recommended that a broad-phase search be performed first by calling `potentials()` in order to quickly rule out bodies that are too far away to collide. **Collisions** uses a [Bounding Volume Hierarchy](https://en.wikipedia.org/wiki/Bounding_volume_hierarchy) (BVH) for its broad-phase search. Calling `potentials()` on a body traverses the BVH and builds a list of potential collision candidates.

```JavaScript
const potentials = polygon.potentials();
```

Once a list of potential collisions is acquired, loop through them and perform a narrow-phase collision test using `collides()`. **Collisions** uses the [Separating Axis Theorem](https://en.wikipedia.org/wiki/Separating_axis_theorem) (SAT) for its narrow-phase collision tests.

```JavaScript
const potentials = polygon.potentials();

for(const body of potentials) {
	if(polygon.collides(body)) {
		console.log('Collision detected!');
	}
}
```

It is also possible to skip the broad-phase search entirely and call `collides()` directly on two bodies.

> **Note:** Skipping the broad-phase search is not recommended. When testing for collisions against large numbers of bodies, performing a broad-phase search using a BVH is *much* more efficient.

```JavaScript
if(polygon.collides(line)) {
	console.log('Collision detected!');
}
```

<a name="anchor-step-5"></a>
## 5. Getting Detailed Collision Information

There is often a need for detailed information about a collision in order to react to it appropriately. This information is stored using a `Result` object. `Result` objects have several properties set on them when a collision occurs, all of which are described in the [documentation](https://sinova.github.com/Collisions/).

For convenience, there are several ways to create a `Result` object. `Result` objects do not belong to any particular collision system, so any of the following methods for creating one can be used interchangeably. This also means the same `Result` object can be used for collisions across multiple systems.

> **Note:** It is highly recommended that `Result` objects be recycled when performing multiple collision tests in order to save memory. The following example creates multiple `Result` objects strictly as a demonstration.

```JavaScript
import {Collisions, Result, Polygon} from 'collisions';

const system     = new Collisions();
const my_polygon = new Polygon(100, 100, 10);

const result1 = new Result();
const result2 = Collisions.createResult();
const result3 = system.createResult();
const result4 = Polygon.createResult();
const result5 = my_polygon.createResult();
```

To use a `Result` object, pass it into `collides()`. If a collision occurs, it will be populated with information about the collision. Take note in the following example that the same `Result` object is being reused each iteration.

```JavaScript
const result     = system.createResult();
const potentials = point.potentials();

for(const body of potentials) {
	if(point.collides(body, result)) {
		console.log(result);
	}
}
```

<a name="anchor-step-6"></a>
## 6. Negating Overlap

A common use-case in collision detection is negating overlap when a collision occurs (such as when a player hits a wall). This can be done using the collision information in a `Result` object (see [Getting Detailed Collision Information](#anchor-getting-detailed-collision-information)).

The three most useful properties on a `Result` object are `overlap`, `overlap_x`, and `overlap_y`. Together, these values describe how much and in what direction the source body is overlapping the target body. More specifically, `overlap_x` and `overlap_y` describe the direction vector, and `overlap` describes the magnitude of that vector.

These values can be used to "push" one body out of another using the minimum distance required. More simply, subtracting this vector from the source body's position will cause the bodies to no longer collide. Here's an example:

```JavaScript
if(player.collides(wall, result)) {
	player.x -= result.overlap * result.overlap_x;
	player.y -= result.overlap * result.overlap_y;
}
```

<a name="anchor-lines"></a>
Lines
===============================================================================

Creating a line is simply a matter of creating a single-sided polygon (i.e. a polygon with only two coordinate pairs).

```JavaScript
const line = new Polygon(200, 5, [[-30, 0], [10, 20]]);
```

<a name="anchor-concave-polygons"></a>
Concave Polygons
===============================================================================

**Collisions** uses the [Separating Axis Theorem](https://en.wikipedia.org/wiki/Separating_axis_theorem) (SAT) for its narrow-phase collision tests. One caveat to SAT is that it only works properly on convex bodies. However, concave polygons can be "faked" by using a series of [Lines](#anchor-lines). Keep in mind that a polygon drawn using [Lines](#anchor-lines) is "hollow".

Handling true concave polygons requires breaking them down into their component convex polygons (Convex Decomposition) and testing them for collisions individually. There are plans to integrate this functionality into the library in the future, but for now, check out [poly-decomp.js](https://github.com/schteppe/poly-decomp.js).

<a name="anchor-rendering"></a>
Rendering
===============================================================================

For debugging, it is often useful to be able to visualize the collision bodies. All of the bodies in a Collision system can be drawn to a `<canvas>` element by calling `draw()` and passing in the canvas' 2D context.

```JavaScript
const canvas  = document.createElement('canvas');
const context = canvas.getContext('2d');

// ...
context.strokeStyle = '#FFFFFF';
context.beginPath();

system.draw(context);

context.stroke();
```

Bodies can be individually drawn as well.

```JavaScript
context.strokeStyle = '#FFFFFF';
context.beginPath();

polygon.draw(context);
circle.draw(context);

context.stroke();
```

The BVH can also be drawn to help test [Bounding Volume Padding](#anchor-bounding-volume-padding).

```JavaScript
context.strokeStyle = '#FFFFFF';
context.beginPath();

system.drawBVH(context);

context.stroke();
```

<a name="anchor-bounding-volume-padding"></a>
Bounding Volume Padding
===============================================================================

When bodies move around within a collision system, the internal BVH has to remove and reinsert the body in order to determine where it belongs in the hierarchy. This is one of the most costly operations in maintaining a BVH. In general, most projects will never see a performance issue from this unless they are dealing with thousands of moving bodies at once. In these cases, it can *sometimes* be beneficial to "pad" the bounding volumes of each body so that the BVH doesn't need to remove and reinsert bodies that haven't changed position too much. In other words, padding the bounding volume allows "breathing room" for the body within it to move around without being flagged for an update.

The tradeoff is that the slightly larger bounding volumes can trigger more false-positives during the broad-phase `potentials()` search. While the narrow phase will ultimately rule these out using Axis Aligned Bounding Box tests, putting too much padding on bodies that are crowded can lead to too many false positives and a diminishing return in performance. It is up to the developer to determine how much padding each body will need based on how much it can move within a single frame and how crowded the bodies in the system are.

Padding can be added to a body when instantiating it (see the [documentation](https://sinova.github.com/Collisions/) for each body) or at any time by changing its `padding` property.

```JavaScript
const padding = 5;
const circle  = new Circle(100, 100, 10, 1, padding);

// ...

circle.padding = 10;
```

<a name="anchor-only-using-sat"></a>
Only using SAT
===============================================================================

Some projects may only have a need to perform SAT collision tests without broad-phase searching. This can be achieved by avoiding collision systems altogether and only using the `collides()` function.

```JavaScript
import {Circle, Polygon, Result} from 'collisions';

const circle  = new Circle(45, 45, 20);
const polygon = new Polygon(50, 50, [[0, 0], [20, 20], [-10, 10]]);
const result  = new Result();

if(circle.collides(polygon, result)) {
	console.log(result);
}
```

<a name="anchor-faq"></a>
FAQ
===============================================================================

## Why shouldn't I just use a physics engine?

Projects requiring physics are encouraged to use one of the several physics engines out there (e.g. [Matter.js](https://github.com/liabru/matter-js), [Planck.js](https://github.com/shakiba/planck.js)). However, many projects end up using physics engines solely for collision detection, and developers often find themselves having to work around some of the assumptions that these engines make (gravity, velocity, friction, etc.). **Collisions** was created to provide robust collision detection and nothing more. In fact, a physics engine could easily be written with **Collisions** at its core.

## Why does the source code seem to have quite a bit of copy/paste?

**Collisions** was written with performance as its primary focus. Conscious decisions were made to sacrifice readability in order to avoid the overhead of unnecessary function calls or property lookups.

## Sometimes bodies can "squeeze" between two other bodies. What's going on?

This isn't caused by faulty collisions, but rather how a project handles its collision responses. There are several ways to go about responding to collisions, the most common of which is to loop through all bodies, find their potential collisions, and negate any overlaps that are found one at a time. Since the overlaps are negated one at a time, the last negation takes precedence and can cause the body to be pushed into another body.

One workaround is to resolve each collision, update the collision system, and repeat until no collisions are found. Keep in mind that this can potentially lead to infinite loops if the two colliding bodies equally negate each other. Another solution is to collect all overlaps and combine them into a single resultant vector and then push the body out, but this can get rather complicated.

There is no perfect solution. How collisions are handled depends on the project.
