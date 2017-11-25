Collisions
===============================================================================

**Collisions** is a JavaScript library used to quickly and accurately detect collisions between Polygons, Circles, Paths, and Points. It combines the efficiency of a [Bounding Volume Hierarchy](https://en.wikipedia.org/wiki/Bounding_volume_hierarchy) (BVH) for broad-phase searching with the accuracy of the [Separating Axis Theorem](https://en.wikipedia.org/wiki/Separating_axis_theorem) (SAT) for narrow-phase collision testing.

* [Installation](#installation)
* [Documentation](#documentation)
* [Usage](#usage)
* [Getting started](#getting-started)
	1. [Creating a collision system](#1--creating-a-collision-system)
	2. [Creating, adding, and removing bodies](#2--creating--adding--and-removing-bodies)
	3. [Testing for collisions](#3--testing-for-collisions)
	4. [Getting detailed collision information](#4--getting-detailed-collision-information)
	5. [Negating overlap](#5--negating-overlap)

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

// Add the player (represented by a Circle)
const player = system.createCircle(0, 0, 10);

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

#### 1. Creating a collision system

**Collisions** provides functions to perform both broad-phase and narrow-phase collision tests. In order to take full advantage of both phases, all bodies need to be tracked within a collision system.

To create a collision system, simply instantiate the Collisions class.

```JavaScript
import Collisions from 'collisions';

const system = new Collisions();
```

#### 2. Creating, adding, and removing bodies

Collision systems expose several convenience functions for creating bodies. These functions create their respective body and automatically insert it into the system.

```JavaScript
const circle  = system.createCircle(100, 100, 10);
const polygon = system.createPolygon(50, 50, [[0, 0], [20, 20], [-10, 10]]);
const path    = system.createPath(-30, 5, [[-30, 0], [-20, -10], [-10, 0]]);
const point   = system.createPoint(10, 10);
```

It's also possible to create bodies separately and insert them into the collision system manually at a later time.

```JavaScript
import {Collisions, Circle, Polygon, Path, Point} from 'collisions';

const system = new Collisions();

const circle  = new Circle(100, 100, 10);
const polygon = new Polygon(50, 50, [[0, 0], [20, 20], [-10, 10]]);
const path    = new Path(-30, 5, [[-30, 0], [-20, -10], [-10, 0]]);
const point   = new Point(10, 10);

// ...

system.insert(circle, polygon, path, point);
```

Bodies can also be removed when they are no longer needed.

```JavaScript
system.remove(polygon, point);
circle.remove();
```

#### 3. Testing for collisions

It is generally recommended that a broad-phase search be performed first before testing for collisions. This is done by called `potentials()` on a body. This gets a list of nearby bodies that could potentially be colliding with it while quickly ruling out bodies that are too far away. It is important to note that the `potentials()` function returns an **Iterator** and *not* an **Array** (see the [FAQ](#faq)). Once a potential list of colliding bodies is obtained, iterate through them and test for collisions.

```JavaScript
const potentials = circle.potentials();

for(const body of potentials) {
	if(circle.collides(body)) {
		console.log('Collision detected!');
	}
}
```

#### 4. Getting detailed collision information

Often there is a need for detailed information about a collision when it occurs. To get this information, a **Result** object can be passed into the narrow-phase collision test. It is highly recommended that **Result** objects be recycled when performing multiple collision tests unless it's necessary to store a specific Result for later use.

```JavaScript
const result     = system.createResult();
const potentials = circle.potentials();

for(body of potentials) {
	if(circle.collides(body, result)) {
		console.log(result);
	}
}
```

For convenience, there are several ways to create a **Result** object. **Result** objects do not belong to any particular collision system, so any method can be used interchangeably and the same **Result** can be used for collisions across several systems.

```JavaScript
import {Collisions, Result} from 'collisions';

const system = new Collisions();

const result1 = system.createResult();
const result2 = Collisions.createResult();
const result3 = new Result();
```

#### 5. Negating overlap

A common use-case for collisions is negating overlap when a collision occurs (such as when a player hits a wall). This can be done with in collision information stored on a passed in **Result** object.

**Result** objects have several properties set on them when a collision occurs (you can read about all of them in the [documentation](https://sinova.github.com/Collisions/docs/)). The three most useful properties are  **overlap**, **overlap\_x**, and **overlap\_y**. Together, these values describe how much and in what direction the source body is overlapping the target body. More specifically, **overlap\_x** and **overlap\_y** make up the direction vector, and **overlap** is the magnitude of that vector.


These values can be used to "push" one body out of another using the minimum distance required. Effectively, subtracting this vector from the source body's position will cause the bodies to no longer collide. Here's a simple example:

```JavaScript
if(player.collides(wall, result)) {
	player.x -= result.overlap * result.overlap_x;
	player.y -= result.overlap * result.overlap_y;
}
```

Bounding Volume Padding
===============================================================================

When bodies move around within a collision system, the internal BVH needs to be updated. Specifically, the body needs to be removed from the hierarchy and reinserted. This is one of the most costly operations in maintaining a BVH. In general, most projects won't need to worry about this unless they are dealing with thousands of moving bodies at once. If performance becomes an issue, it can sometimes be beneficial to "pad" the bounding volumes of each body so that they don't need to be removed and reinserted if they haven't changed position too much. In essence, padding the bounding volume allows "breathing room" for the body within it to move around.

The tradeoff is that the slightly larger bounding volumes can trigger more false-positives during the broad-phase `potentials()` search. While the narrow phase will quickly rule these out using Axis Aligned Bounding Box tests, putting too much padding on bodies that are crowded can lead to too many false positives and a diminishing return in performance. It is up to the developer to determine how much padding each body will need based on how much it can move within a single frame and how crowded the bodies in the system are.

Padding can be added to a body when instantiating it (see the [documentation](https://sinova.github.com/Collisions/docs/) for each body) or at any point by changing its **padding** property.

```JavaScript
const padding = 5;
const circle  = new Circle(100, 100, 10, 1, padding);

// ...

circle.padding = 10;
```

Only using SAT
===============================================================================

Some projects may only have a need to perform SAT collision tests without broad-phase searching. This can be achieved by simply not adding the bodies to a system and not using the **potentials()** function.

```JavaScript
import {Circle, Polygon, Result} from 'collisions';

const circle  = new Circle(45, 45, 20);
const polygon = new Polygon(50, 50, [[0, 0], [20, 20], [-10, 10]]);
const result  = new Result();

if(circle.collides(polygon, result)) {
	console.log(result);
}
```

FAQ
===============================================================================

#### Why shouldn't I just use a physics engine?

Projects requiring physics are encouraged to use one of the several physics engines out there (e.g. [Matter.js](https://github.com/liabru/matter-js) or [Planck.js](https://github.com/shakiba/planck.js)). However, many projects use physics engines solely for collision detection, and developers often find themselves having to work around some of the assumptions that are made by these engines (gravity, velocity, friction, etc.). **Collisions** was written to fill this need.

#### Why does potentials() return an Iterator instead of an Array?

Populating an array with references to potential collisions can take up quite a bit of memory when done for thousands of bodies (even if each body has an array that it recycles). For instance, if the system has 1,000 bodies and each one is potentially colliding with five bodies on average, that's 5,000 references in total. Do this every frame and the garbage collector can start to get noticeably bogged down. Iterators solve this problem by only detecting and yielding a single potential collision at a time. Memory profiles showed the allocations per frame drop from 50 kilobytes to 10 bytes. The reduction in garbage collection far outweighs the small peformance cost of using Iterators.

#### Why does the source code seem to have a lot of copy/paste?

**Collisions** was written with performance as its primary focus. Conscious choices were made to sacrifice readability in order to avoid the overhead of unnecessary function calls or property lookups.

Limitations
===============================================================================

SAT based collision detection assumes all tested bodies are convex. Handling concave bodies requires breaking them down into their component convex bodies (Convex Decomposition) and testing them for collisions individually. There are plans to integrate this functionality into the library in the future, but for now, check out [poly-decomp.js](https://github.com/schteppe/poly-decomp.js).
