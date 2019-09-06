let wasm = null;
let wrapper = null;

function base64Decode(sBase64) {
    const sBinaryString = atob(sBase64);
    const aBinaryView = new Uint8Array(sBinaryString.length);
    Array.prototype.forEach.call(aBinaryView, function (el, idx, arr) {
        arr[idx] = sBinaryString.charCodeAt(idx);
    });
    return aBinaryView;
}

self.onmessage = (e) => {
    const message = e.data;
    const setup = message.setup;
    if (setup) {
        (async () => {
            const bytes = base64Decode(setup.wasmBase64);
            const module = await WebAssembly.compile(bytes);
            wrapper = eval(setup.wasmWrapper);
            wasm = (await WebAssembly.instantiate(module, {
                './tonsdk.js': wrapper
            })).exports;
            wrapper.setup(wasm);
            postMessage({
                setup: {}
            })
        })();
        return;
    }
    const request = message.request;
    if (request) {
        const result = wrapper.request(request.method, request.params);
        postMessage({
            response: {
                id: request.id,
                result,
            }
        });
    }
};
