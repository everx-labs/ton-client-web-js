let prev = Date.now() / 1000;
function logTime(message) {
    const now = Date.now() / 1000;
    console.log(message, now, String((now - prev).toFixed(3)));
    prev = now;
}

const inlineAssetsLoader = import('./inline-assets.js');
logTime("0");

const createLibrary = async () => {
    logTime("1");
    const inlineAssets = (await inlineAssetsLoader).default;
    const workerBlob = new Blob(
        [inlineAssets.worker],
        { type: 'application/javascript' }
    );
    const workerUrl = URL.createObjectURL(workerBlob);
    const worker = new Worker(workerUrl);
    logTime("2");

    const activeRequests = new Map();

    let nextActiveRequestId = 1;

    worker.onerror = (evt) => {
        console.log(`Error from Web Worker: ${evt.message}`);
    };

    const library = {
        request: (method, params, callback) => {
            logTime("3");
            const id = nextActiveRequestId;
            nextActiveRequestId += 1;
            activeRequests.set(id, {
                callback
            });
            logTime("4");
            worker.postMessage({
                request: {
                    id,
                    method,
                    params
                }
            });
            logTime("5");
        },
    };
    let libraryResolver = null;
    logTime("6");

    worker.onmessage = (evt) => {
        logTime("7");
        const setup = evt.data.setup;
        if (setup) {
            if (libraryResolver) {
                libraryResolver(library);
            }
            return;
        }
        logTime("8");

        const response = evt.data.response;
        if (response) {
            const activeRequest = activeRequests.get(response.id);
            if (!activeRequest) {
                return;
            }
            logTime("9");
            activeRequests.delete(response.id);
            logTime("10");
            if (activeRequest.callback) {
                let { result } = response;
                // Remove BOM from result
                result = result.charCodeAt(0) === 0xFEFF ? result.substr(1) : result;
                const { result_json, error_json } = JSON.parse(result);
                activeRequest.callback(result_json, error_json);
            }
            logTime("11");
        }
    };

    return new Promise((resolve) => {
        logTime("12");
        libraryResolver = resolve;
        worker.postMessage({
            setup: {
                wasmBase64: inlineAssets.wasmBase64.join(''),
                wasmWrapper: inlineAssets.wasmWrapper,
            }
        });
        logTime("13");
    });
};

window.onload = () => {
    (async () => {
        logTime("14");
        const library = await createLibrary();
        logTime("15");
        const request = (method, params) => {
            return new Promise((resolve, reject) => {
                logTime("16");
                library.request(method, params, (result, err) => {
                    logTime("17");
                    if (err !== '') {
                        reject(err);
                    } else {
                        resolve(JSON.parse(result));
                    }
                    logTime("18");
                });
            });
        };
        logTime("19");
        const version = await request('version', '12');
        logTime("20");
        document.body.innerText = `TON Client Version: ${version}`;
        logTime("21");
    })();
};
