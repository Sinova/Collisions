Collisions
===============================================================================

**Collisions** is a JavaScript library for quickly and accurately detecting collisions between Polygons, Circles, Paths, and Points. It combines the efficiency of a [Bounding Volume Hierarchy](https://en.wikipedia.org/wiki/Bounding_volume_hierarchy) (BVH) for broad-phase searching and the accuracy of the [Separating Axis Theorem](https://en.wikipedia.org/wiki/Separating_axis_theorem) (SAT) for narrow-phase collision testing.

* [Installation](#installation)
* [Documentation](#documentation)
* [Demos](#demos)
* [Usage](#usage)
* [Getting Started](#getting-started)
	1. [Creating a Collision System](#1--creating-a-collision-system)
	2. [Creating, Inserting, and Removing Bodies](#2--creating--inserting--and-removing-bodies)
	3. [Updating the Collision System](#3--updating-the-collision-system)
	4. [Testing for Collisions](#4--testing-for-collisions)
	5. [Getting Detailed Collision Information](#5--getting-detailed-collision-information)
	6. [Negating Overlap](#6--negating-overlap)
* [Bounding Volume Padding](#bounding-volume-padding)
* [Only using SAT](#only-using-sat)
* [FAQ](#faq)

Installation
===============================================================================

```bash
npm install collisions
```

Documentation
===============================================================================

View the [documentation](https://sinova.github.com/Collisions/docs/) (this README is also there).

Demos
===============================================================================

* [Movement](https://sinova.github.com/Collisions/demo)
* [Stress Test](https://sinova.github.com/Collisions/demo?stress)

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
const wall1 = system.createPolygon(10, 10, [[-20, -40], [-10, -70], [30, -40], [20, 30], [-30, 20]]);
const wall2 = system.createPolygon(10, 10, [[-20, -40], [-10, -70], [30, -40], [20, 30], [-30, 20]]);
const wall3 = system.createPolygon(10, 10, [[-20, -40], [-10, -70], [30, -40], [20, 30], [-30, 20]]);

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

Getting Started
===============================================================================

#### 1. Creating a Collision System

**Collisions** provides functions for performing both broad-phase and narrow-phase collision tests. In order to take full advantage of both phases, bodies need to be tracked within a collision system.

Call the Collisions constructor to create a collision system.

```JavaScript
import Collisions from 'collisions';

const my_system = new Collisions();
```

#### 2. Creating, Inserting, and Removing Bodies

**Collisions** supports the following body types:

* **Circle:** A closed shape with infinite sides equidistant from a single point
* **Polygon:** A closed shape made up of line segments
* **Path:** An open shape made up of line segments
* **Point:** A single position

To use them, import the desired body class, call its constructor, and insert it into the collision system using `insert()`.

```JavaScript
import {Collisions, Circle, Polygon, Path, Point} from 'collisions';

const my_system = new Collisions();

const my_circle  = new Circle(100, 100, 10);
const my_polygon = new Polygon(50, 50, [[0, 0], [20, 20], [-10, 10]]);
const my_path    = new Path(200, 5, [[-30, 0], [-20, -10], [-10, 0]]);
const my_point   = new Point(10, 10);

my_system.insert(my_circle)
my_system.insert(my_polygon, my_path, my_point);
```

Collision systems expose several convenience functions for creating bodies and inserting them into the system in one step. This also avoids having to import the different body classes.

```JavaScript
import Collisions from 'collisions';

const my_system = new Collisions();

const my_circle  = my_system.createCircle(100, 100, 10);
const my_polygon = my_system.createPolygon(50, 50, [[0, 0], [20, 20], [-10, 10]]);
const my_path    = my_system.createPath(-30, 5, [[-30, 0], [-20, -10], [-10, 0]]);
const my_point   = my_system.createPoint(10, 10);
```

And, of course, bodies can be removed when they are no longer needed.

```JavaScript
my_system.remove(my_polygon, my_point);
my_circle.remove();
```

#### 3. Updating the Collision System

Collision systems need to be updated when the bodies within them change. This includes when bodies are inserted, removed, or when their properties change (e.g. position, angle, scaling, etc.). Updating a collision system is done by calling `update()` and should typically should occur once per frame.

```JavaScript
my_system.update();
```

The optimal time for updating a collision system is **after** its bodies have changed and **before** collisions are tested. For example, a game loop might use the following order of events:

```JavaScript
function gameLoop() {
	handleInput();

	my_system.update();

	handleCollisions();
	render();
}
```

#### 4. Testing for Collisions

When testing for collisions on a body, it is generally recommended that a broad-phase search be performed first by calling `potentials()` in order to quickly rule out bodies that are too far away to collide. **Collisions** uses a [Bounding Volume Hierarchy](https://en.wikipedia.org/wiki/Bounding_volume_hierarchy) (BVH) for its broad-phase search. Calling `potentials()` on a body traverses the BVH and builds a list of potential collision candidates.

```JavaScript
const my_potentials = my_polygon.potentials();
```

Once a list of potential collisions is acquired, loop through them and perform a narrow-phase collision test using `collides()`. **Collisions** uses the [Separating Axis Theorem](https://en.wikipedia.org/wiki/Separating_axis_theorem) (SAT) for its narrow-phase collision tests.

```JavaScript
const my_potentials = my_polygon.potentials();

for(const body of potentials) {
	if(my_polygon.collides(body)) {
		console.log('Collision detected!');
	}
}
```

It is also possible to skip the broad-phase search entirely and call `collides()` directly on two bodies.

> **Note:** Skipping the broad-phase search is not recommended. When testing for collisions against large numbers of bodies, performing a broad-phase search using a BVH is *much* more efficient.

```JavaScript
if(my_polygon.collides(my_path)) {
	console.log('Collision detected!');
}
```

#### 5. Getting Detailed Collision Information

There is often a need for detailed information about a collision in order to react to it appropriately. This information is stored using a `Result` object. `Result` objects have several properties set on them when a collision occurs, all of which are described in the [documentation](https://sinova.github.com/Collisions/docs/).

For convenience, there are several ways to create a `Result` object. `Result` objects do not belong to any particular collision system, so any of the following methods for creating one can be used interchangeably. This also means the same `Result` object can be used for collisions across multiple systems.

> **Note:** It is highly recommended that `Result` objects be recycled when performing multiple collision tests in order to save memory. The following example creates multiple `Result` objects strictly as a demonstration.

```JavaScript
import {Collisions, Result, Polygon} from 'collisions';

const my_system  = new Collisions();
const my_polygon = new Polygon(100, 100, 10);

const result1 = new Result();
const result2 = Collisions.createResult();
const result3 = Polygon.createResult();
const result4 = my_system.createResult();
const result5 = my_polygon.createResult();
```

To use a `Result` object, pass it into `collides()`. If a collision occurs, it will be populated with information about the collision. Take note in the following example that the same `Result` is being reused each iteration.

```JavaScript
const my_result     = my_system.createResult();
const my_potentials = my_point.potentials();

for(const body of my_potentials) {
	if(my_point.collides(body, my_result)) {
		console.log(my_result);
	}
}
```

#### 6. Negating Overlap

A common use-case in collision detection is negating overlap when a collision occurs (such as when a player hits a wall). This can be done using the collision information in a `Result` object (see [Getting Detailed Collision Information](#4--getting-detailed-collision-information)).

The three most useful properties on a `Result` object are `overlap`, `overlap_x`, and `overlap_y`. Together, these values describe how much and in what direction the source body is overlapping the target body. More specifically, `overlap_x` and `overlap_y` describe the direction vector, and `overlap` describes the magnitude of that vector.

These values can be used to "push" one body out of another using the minimum distance required. Effectively, subtracting this vector from the source body's position will cause the bodies to no longer collide. Here's a simple example:

```JavaScript
if(player.collides(wall, result)) {
	player.x -= result.overlap * result.overlap_x;
	player.y -= result.overlap * result.overlap_y;
}
```

Concave Polygons
===============================================================================

**Collisions** uses the [Separating Axis Theorem](https://en.wikipedia.org/wiki/Separating_axis_theorem) (SAT) for its narrow-phase collision tests. One caveat to SAT is that it only works properly on convex bodies. However, concave polygons can be "faked" by using a `Path`, which is a collection of line segments. Keep in mind that a polygon drawn using a `Path` is "hollow" and only detects collisions if bodies are touching its line segments.


Handling true concave polygons requires breaking them down into their component convex polygons (Convex Decomposition) and testing them for collisions individually. There are plans to integrate this functionality into the library in the future, but for now, check out [poly-decomp.js](https://github.com/schteppe/poly-decomp.js).


Bounding Volume Padding
===============================================================================

When bodies move around within a collision system, the internal BVH needs to be updated. Specifically, the body needs to be removed from the BVH and reinserted. This is one of the most costly operations in maintaining a BVH. In general, most projects won't need to worry about this unless they are dealing with thousands of moving bodies at once. In these cases, it can *sometimes* be beneficial to "pad" the bounding volumes of each body so that they don't need to be removed and reinserted if they haven't changed position too much. In essence, padding the bounding volume allows "breathing room" for the body within it to move around.

The tradeoff is that the slightly larger bounding volumes can trigger more false-positives during the broad-phase `potentials()` search. While the narrow phase will ultimately rule these out using Axis Aligned Bounding Box tests, putting too much padding on bodies that are crowded can lead to too many false positives and a diminishing return in performance. It is up to the developer to determine how much padding each body will need based on how much it can move within a single frame and how crowded the bodies in the system are.

Padding can be added to a body when instantiating it (see the [documentation](https://sinova.github.com/Collisions/docs/) for each body) or at any time by changing its `padding` property.

```JavaScript
const my_padding = 5;
const my_circle  = new Circle(100, 100, 10, 1, my_padding);

// ...

my_circle.padding = 10;
```

Only using SAT
===============================================================================

Some projects may only have a need to perform SAT collision tests without broad-phase searching. This can be achieved by avoiding collision systems altogether and only using the `collides()` function.

```JavaScript
import {Circle, Polygon, Result} from 'collisions';

const my_circle  = new Circle(45, 45, 20);
const my_polygon = new Polygon(50, 50, [[0, 0], [20, 20], [-10, 10]]);
const my_result  = new Result();

if(my_circle.collides(my_polygon, my_result)) {
	console.log(my_result);
}
```

FAQ
===============================================================================

#### Why shouldn't I just use a physics engine?

Projects requiring physics are encouraged to use one of the several physics engines out there (e.g. [Matter.js](https://github.com/liabru/matter-js), [Planck.js](https://github.com/shakiba/planck.js)). However, many projects use physics engines solely for collision detection, and developers often find themselves having to work around some of the assumptions that are made by these engines (gravity, velocity, friction, etc.). **Collisions** was created solely to provide robust collision detection and nothing more. In fact, a physics engine could easily be written with **Collisions** at its core.

#### Why does the source code seem to have quite a bit of copy/paste?

**Collisions** was written with performance as its primary focus. Conscious decisions were made to sacrifice readability in order to avoid the overhead of unnecessary function calls or property lookups.
