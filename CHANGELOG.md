# [20.0.0](https://github.com/netwin/date-time-picker/compare/19.1.0...20.0.0) (2025-07-23)


### Bug Fixes

* **deps:** update dependencies ([7762b54](https://github.com/netwin/date-time-picker/commit/7762b54f66338a2bc560850503cbe4f5db813aad))


### Features

* convert all components to standalone ([98092d2](https://github.com/netwin/date-time-picker/commit/98092d2795606639d55077306015c09a2838461b))
* update Angular, Drop dialog support, move from scss to css ([f35dd7f](https://github.com/netwin/date-time-picker/commit/f35dd7feab35d52ee2b6cf604a662b9823dd7cdf))


### BREAKING CHANGES

* Clients need to update to Angular 20 in order to use this version. As I wrote last october in #3, Dialog and Popup support were finally dropped. Only the "inline" mode is supported from now on. Additionally, probably irrelevant for clients, this library switched from scss to css which simplifies the build process.

# [19.1.0](https://github.com/netwin/date-time-picker/compare/19.0.0...19.1.0) (2025-05-15)


### Features

* add logic to disable Today button when it is not selectable ([5a3202d](https://github.com/netwin/date-time-picker/commit/5a3202de1eba3423e539cd482ef176163b8f5af8))
* improve scss ([9d6e18c](https://github.com/netwin/date-time-picker/commit/9d6e18c304bd33925a6e1f07557d36471932c03a))

# [19.0.0](https://github.com/netwin/date-time-picker/compare/18.4.0...19.0.0) (2024-12-12)


### Bug Fixes

* update Angular version in library package.json ([3fcbc47](https://github.com/netwin/date-time-picker/commit/3fcbc4723e571d292f439d13f984ee878e5d1d92))


### Features

* update Angular to version 19 ([47765e8](https://github.com/netwin/date-time-picker/commit/47765e837dd1ada3f75a0bd6d84a941941139f11))


### BREAKING CHANGES

* Clients need to update their Angular version to use this library.

# [18.4.0](https://github.com/netwin/date-time-picker/compare/18.3.0...18.4.0) (2024-11-13)


### Features

* **calendar:** add button to jump to and select today's date ([fbf483a](https://github.com/netwin/date-time-picker/commit/fbf483a467bc873eea2fb7530addffba4439f9f6))

# [18.3.0](https://github.com/netwin/date-time-picker/compare/18.2.0...18.3.0) (2024-11-08)


### Features

* **date-time-inline:** add range limit option for range selection mode ([dfed5ff](https://github.com/netwin/date-time-picker/commit/dfed5ff068a4654a01d61b37e5422203c9bb5411))

# [18.2.0](https://github.com/netwin/date-time-picker/compare/18.1.0...18.2.0) (2024-10-12)


### Features

* **docs:** add initial documentation implementation using ng-doc ([83cd3d9](https://github.com/netwin/date-time-picker/commit/83cd3d9da313aedda62b3eb302f2b11d53ef1b1f))

# [18.1.0](https://github.com/netwin/date-time-picker/compare/18.0.0...18.1.0) (2024-10-11)


### Bug Fixes

* **ci:** enable lint/test before releases again ([94f8fc5](https://github.com/netwin/date-time-picker/commit/94f8fc51e482eb359e141cd692fd6d13a7fe66cb))
* **ci:** use "NODE_AUTH_TOKEN" instead of "NPM_TOKEN" as release env variable ([e344963](https://github.com/netwin/date-time-picker/commit/e344963477e4d530d7430e6d1370c385758885ed))
* **deps:** update dependencies ([0fef43d](https://github.com/netwin/date-time-picker/commit/0fef43da01c38886f2a79ca5e2371fc0ef12e414))
* **dialog-service:** add providedIn parameter ([d904a67](https://github.com/netwin/date-time-picker/commit/d904a676658d7cfe3b530686f2f9dbe7cbdf8f02))
* fix many linter warnings / errors ([e4f1fde](https://github.com/netwin/date-time-picker/commit/e4f1fdeb70e3dc7a42ccecefaea15eb5209562ff))
* **ng:** correctly set compilation mode per application/project ([737b4a6](https://github.com/netwin/date-time-picker/commit/737b4a69e28041d3a237989e5a7a46a5175b890f))
* redeploying ([64d28ae](https://github.com/netwin/date-time-picker/commit/64d28ae0685d8297d42180d18e5491791c217855))
* redeploying ([4bb3bc9](https://github.com/netwin/date-time-picker/commit/4bb3bc99c4b01e8e1f7376c49f325412fa61f549))
* **tests:** remove providedIn from some injectables for now ([b09021d](https://github.com/netwin/date-time-picker/commit/b09021d381b77130fdff2b09ef361514c069f8a2))
* use correct version and include project package.json in release commit ([054a96e](https://github.com/netwin/date-time-picker/commit/054a96eb01ff57ddedd2b1f12c6967f710a99f4b))


### Features

* add eslint / update config ([3bb47da](https://github.com/netwin/date-time-picker/commit/3bb47da42822c302f0a34ee2091072bb85f9cc80))
* enable publishing to npm ([b774749](https://github.com/netwin/date-time-picker/commit/b774749fb7884b6fc8471e881dd7c7b26e32b4e4))
* **husky:** add eslint,prettier pre-commit hook ([dcfead0](https://github.com/netwin/date-time-picker/commit/dcfead0ca02858aa48607ed9d3f6a9b541c1b381))
* introduce prettier ([1709198](https://github.com/netwin/date-time-picker/commit/170919803bf2c2088594b1cde1d5af05fef7b75b))
