# changelog

## 3.0.1

- fix published build

## 3.0.0

- **break**: remove `draw` and `draw_bvh` helpers from the classes and
  export equivalent plain functions from the index and `draw.js` module:
  `draw_bodies`, `draw_circle`, `draw_polygon`, and `draw_bvh`
  ([#4](https://github.com/ryanatkn/collisions/pull/4))
- **break**: remove `create_result` helpers from the classes and rename `Result` to `Collision_Result`
  ([#4](https://github.com/ryanatkn/collisions/pull/4))
- add optional `filter` and `results` params to the `potentials` functions
  ([#4](https://github.com/ryanatkn/collisions/pull/4))
- export `Some_Body` type and `aabb_aabb` collision helper
  ([#4](https://github.com/ryanatkn/collisions/pull/4))
- fix type narrowing
  ([#4](https://github.com/ryanatkn/collisions/pull/4))
- don't bundle the published lib
  ([#4](https://github.com/ryanatkn/collisions/pull/4))

## 2.0.27

- upgrade `@feltcoop/gro@0.48.0`

## 2.0.26

- upgrade `@feltcoop/gro@0.34.0`

## 2.0.25

- upgrade `@feltcoop/gro@0.23.4` to fix typemap paths

## 2.0.24

- include `src/` in published package

## 2.0.23

- upgrade Gro and publish typemaps

## 2.0.22

- upgrade Gro and delete custom task
- remove temporary assertions

## 2.0.21

- fix types with missing static `Collisions.create_result`

## 2.0.20

- add commonjs alongside ESM build
  ([#2](https://github.com/ryanatkn/collisions/pull/2))

## 2.0.19

- fix build

## 2.0.18

- distribute as ES modules

## 2.0.17

- convert to TypeScript
  ([#1](https://github.com/ryanatkn/collisions/pull/1))

<hr/>

fork of <https://github.com/Sinova/Collisions>
