Collisions
===============================================================================

**Collisions** is a JavaScript library used to quickly and accurately detect collisions between Polygons, Circles, Lines, and Points. It combines the efficiency of a [Bounding Volume Hierarchy](https://en.wikipedia.org/wiki/Bounding_volume_hierarchy) (BVH) for broad-phase searching with the accuracy of the [Separating Axis Theorem](https://en.wikipedia.org/wiki/Separating_axis_theorem) (SAT) for narrow-phase collision testing.

Installation
===============================================================================

```bash
npm install collisions
```

Documentation
===============================================================================

[Click here](https://sinova.github.com/Collisions/docs/) to view the documentation (this README is also there).

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

// Loop through the potential collisions
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

**Collisions** provides functions to perform both broad-phase and narrow-phase collision tests. In order to take full advantage of both phases, all bodies need to be tracked within a collision system.

To create a collision system, simply instantiate the Collisions class:

```JavaScript
import Collisions from 'collisions';

const system = new Collisions();
```

The resulting system exposes several functions for creating bodies:

```JavaScript
const circle  = system.createCircle(100, 100, 10);
const polygon = system.createPolygon(50, 50, [[0, 0], [20, 20], [-10, 10]]);
const line    = system.createLine(-30, 5, [[-30, 0], [-20, -10], [-10, 0]]);
const point   = system.createPoint(10, 10);
```

Those functions create their respective body and automatically insert it into the system. However, it's possible to create bodies separately and insert them into the system manually:

```JavaScript
import {Collisions, Circle, Polygon, Line, Point} from 'collisions';

const system  = new Collisions();
const circle  = new Circle(100, 100, 10);
const polygon = new Polygon(50, 50, [[0, 0], [20, 20], [-10, 10]]);
const line    = new Line(-30, 5, [[-30, 0], [-20, -10], [-10, 0]]);
const point   = new Point(10, 10);

system.insert(circle, polygon, line, point);
```

Bodies can be removed also:

```JavaScript
system.remove(polygon, point);
```

When the **result** parameter is supplied to a collision function, three of the properties set on the object are **overlap**, **overlap\_x**, and **overlap\_y**. Together, these values describe how much and in what direction a body is overlapping another body. More specifically, **overlap\_x** and **overlap\_y** make up the direction vector and **overlap** is the magnitude of that vector.

These values can be used to "push" one body out of another using the minimum distance required. Effectively, subtracting this vector from an body's position will cause the objects to no longer collide. Here's a simple example:

```JavaScript

const result = system.createResult();

if(player.collides(wall, result)) {
	player.x -= result.overlap * result.overlap_x;
	player.y -= result.overlap * result.overlap_y;
}
```

FAQ
===============================================================================

#### Why shouldn't I just use a physics engine?

Projects requiring physics are enthusiastically recommended to use one of the many physics engines that are out there (e.g. [Matter.js](https://github.com/liabru/matter-js) or [Planck.js](https://github.com/shakiba/planck.js)). However, many projects use physics engines solely for collision detection, and developers often find themselves having to work around some of the assumptions that are made by these engines (gravity, velocity, friction, etc.). **Collisions** was written to fill this need.

#### Why does potentials() return an Iterator instead of an Array?

Populating an array with references to potential collisions can take up quite a bit of memory when done for thousands of bodies (even if each body has an array that it recycles). For instance, if the system has 1,000 bodies and each one is potentially colliding with five bodies on average, that's 5,000 references in total. Do this every frame and the garbage collector can start to get noticeably bogged down. Iterators solve this problem by only detecting and yielding a single potential collision at a time as you loop through them. Memory profiles showed the allocations per frame drop from 50 kilobytes to 10 bytes. The reduction in garbage collection far outweighs the small peformance cost of using Iterators.

#### Why does the source code seem to have a lot of copy/paste?

**Collisions** was written with performance as its primary focus. Conscious choices were made to sacrifice readability in order to avoid the overhead of unnecessary function calls or property lookups.

Limitations
===============================================================================

SAT assumes all tested polygons are convex. Handling concave shapes requires breaking them down into their component convex polygons (Convex Decomposition) and testing them for collisions individually. There are plans to integrate this functionality into the library in the future, but for now, check out [poly-decomp.js](https://github.com/schteppe/poly-decomp.js).
