const workerScript = '';

//---

const wasmOptions = {
    debugLog: null,
    binaryURL: '',
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

    let nextActiveRequestId = 1;

    worker.onerror = (evt) => {
        console.log(`Error from Web Worker: ${evt.message}`);
    };

    const library = {
        request: (method, params, callback) => {
            const id = nextActiveRequestId;
            nextActiveRequestId += 1;
            activeRequests.set(id, {
                callback
            });
            worker.postMessage({
                request: {
                    id,
                    method,
                    params
                }
            });
        },
    };
    let libraryResolver = null;

    worker.onmessage = (evt) => {
        const setup = evt.data.setup;
        if (setup) {
            if (libraryResolver) {
                libraryResolver(library);
            }
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

    const e = Date.now();
    let wasmModule;
    if (!wasmOptions.binaryURL) {
    }
    const fetched = fetch(wasmOptions.binaryURL);
    if (WebAssembly.compileStreaming) {
        debugLog('compileStreaming binary');
        wasmModule = await WebAssembly.compileStreaming(fetched);
    } else {
        debugLog('compile binary');
        wasmModule = await WebAssembly.compile(await (await fetched).arrayBuffer());
    }
    debugLog(`compile time ${Date.now() - e}`);

    return new Promise((resolve) => {
        libraryResolver = resolve;
        worker.postMessage({
            setup: {
                wasmModule,
            }
        });
    });
};

export function setWasmOptions(options) {
    Object.assign(wasmOptions, options);
}

export const clientPlatform = {
    fetch,
    WebSocket,
    createLibrary,
};
