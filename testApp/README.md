# ton-client-web-js

TON Labs Client Library for Web Test App

This project contains the `testApp` that runs the main test suite from `ton-client-js`.

# Requirements

Common:
- NodeJs (at least 12)

# Run Tests

```shell script
npm install
node prepare-suite.js
node run-suite.js
```

# Options

There are some options for preparing and testing:
- `ton-client-js` package besided of the `ton-client-web-js` folder – if it exists then this local package will be used instead of the npm version (local `ton-client-js` will be packed with `npm pack` and then installed into the `testApp` package). This may be useful for running tests with a non published version of the `ton-client-js`.
- `USE_NODE_SE` and `TON_NETWORK_ADDRESS` env variables – used to specify blockchain network for tests. Must be set before `prepare-suite.js` script execution.    
- `TC_BIN_SRC` env variable – can be used to specify a local path of a folder with alternative react native binaries. Variable must be set before `prepare-suite.js` execution. This may be useful for running tests with a non published version of the core library. The required content for this folder is:
  - `ios/libtonclient.a`
  - `android/arm64-v8a/libtonclient.so`
  - `android/armeabi-v7a/libtonclient.so`
  - `android/x86/libtonclient.so`
- `TON-SDK` project besided of the `ton-client-web-js` folder – if it exists and `TC_BIN_SRC` doesn't specified then `TC_BIN_SRC` will be set to build output for the WASM core library. This may be useful for running tests with a non published version of the core library.
  
   
---
Copyright 2018-2020 TON DEV SOLUTIONS LTD.

Licensed under the SOFTWARE EVALUATION License (the "License"); you may not use
this file except in compliance with the License.

You may obtain a copy of the License at: https://www.ton.dev/licenses

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific TON DEV software governing permissions and
limitations under the License.
