
// This file is just a template that used to generate index.js at npm installation stage

import { TONClient } from 'ton-client-js';

const workerScript = '';

//---

const wasmOptions = {
    debugLog: null,
    binaryURL: '/tonclient.wasm',
};

function debugLog(message) {
    if (wasmOptions.debugLog) {
        wasmOptions.debugLog(message);
    }
}

export const createLibrary = async () => {
    const workerBlob = new Blob(
        [workerScript],
        { type: 'application/javascript' }
    );
    const workerUrl = URL.createObjectURL(workerBlob);
    const worker = new Worker(workerUrl);

    const activeRequests = new Map();

    // Deferred requests are accumulated before WASM module have been loaded
    let deferredRequests = [];

    let nextActiveRequestId = 1;

    worker.onerror = (evt) => {
        console.log(`Error from Web Worker: ${evt.message}`);
    };

    const library = {
        request: (method, params, callback) => {
            if (method === 'version') {
                callback('"__VERSION__"', '');
                return;
            }
            const id = nextActiveRequestId;
            nextActiveRequestId += 1;
            const request = {
                id,
                method,
                params,
            };
            const isDeferredSetup = (method === 'setup') && (deferredRequests !== null);
            activeRequests.set(id, {
                callback: isDeferredSetup ? () => {} : callback
            });
            if (deferredRequests !== null) {
                deferredRequests.push(request);
            } else {
                worker.postMessage({ request });
            }
            if (isDeferredSetup) {
                callback('', '');
            }
        },
    };

    worker.onmessage = (evt) => {
        const setup = evt.data.setup;
        if (setup) {
            for (const request of deferredRequests) {
                worker.postMessage({ request });
            }
            deferredRequests = null;
            return;
        }

        const response = evt.data.response;
        if (response) {
            const activeRequest = activeRequests.get(response.id);
            if (!activeRequest) {
                return;
            }
            activeRequests.delete(response.id);
            if (activeRequest.callback) {
                let { result } = response;
                // Remove BOM from result
                result = result.charCodeAt(0) === 0xFEFF ? result.substr(1) : result;
                const { result_json, error_json } = JSON.parse(result);
                activeRequest.callback(result_json, error_json);
            }
        }
    };

    (async () => {
        const e = Date.now();
        let wasmModule;
        const fetched = fetch(wasmOptions.binaryURL);
        if (WebAssembly.compileStreaming) {
            debugLog('compileStreaming binary');
            wasmModule = await WebAssembly.compileStreaming(fetched);
        } else {
            debugLog('compile binary');
            wasmModule = await WebAssembly.compile(await (await fetched).arrayBuffer());
        }
        worker.postMessage({
            setup: {
                wasmModule,
            }
        });
        debugLog(`compile time ${Date.now() - e}`);
    })();

    return Promise.resolve(library);
};

export function setWasmOptions(options) {
    Object.assign(wasmOptions, options);
}

export const clientPlatform = {
    fetch,
    WebSocket,
    createLibrary,
};

TONClient.setLibrary({
    fetch,
    WebSocket,
    createLibrary
});

export default TONClient;
