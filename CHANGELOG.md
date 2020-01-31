# Release Notes
All notable changes to this project will be documented in this file.

## 0.19.1 - January 29, 2020

### Fixed
- Loading of `tonclient.wasm` is optimized. Now `tonclient.wasm` loaded in binary form using `compileStreaming` which caches compiled module.
- Core request `version` is implemented in JS part so no need to request core.
- Setup sequence of `TONClient` is optimized:
    - JS part performs setup immediately;
    - core setup is deferred until core module have been loaded. So if app doesn't use core functions of TONClient it is ready to work immediately after client creation.

### Breaking Compatibility
- Web applications that used this library must publish `tonclient.wasm` to website. If `tonclient.wasm` doesn't published in root then module path must be specified in `setWasmOptions`:
    ```javascript
    import { TONClient, setWasmOptions } from 'ton-client-web-js';
    ...
    setWasmOptions({
        binaryURL: '/modules/tonclient.wasm',
    });
    ```
