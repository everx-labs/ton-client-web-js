const inlineAssetsLoader = import('./inline-assets');

const createLibrary = async () => {
    const inlineAssets = (await inlineAssetsLoader).default;
    const workerBlob = new Blob(
        [inlineAssets.worker],
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

    return new Promise((resolve) => {
        libraryResolver = resolve;
        worker.postMessage({
            setup: {
                wasmBase64: inlineAssets.wasmBase64.join(''),
                wasmWrapper: inlineAssets.wasmWrapper,
            }
        });
    });
};

const { TONClient } = require('ton-client-js');
TONClient.setLibrary({
    fetch,
    WebSocket,
    createLibrary
});

module.exports = {
    TONClient
};
