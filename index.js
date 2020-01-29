import { TONClient } from 'ton-client-js';
const workerScript = `
const wasmWrapper = (function() {
let wasm = null;
const result = {
    setup: (newWasm) => {
        wasm = newWasm;
    },
};


const heap = new Array(32);

heap.fill(undefined);

heap.push(undefined, null, true, false);

function getObject(idx) { return heap[idx]; }

let heap_next = heap.length;

function dropObject(idx) {
    if (idx < 36) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });

cachedTextDecoder.decode();

let cachegetUint8Memory0 = null;
function getUint8Memory0() {
    if (cachegetUint8Memory0 === null || cachegetUint8Memory0.buffer !== wasm.memory.buffer) {
        cachegetUint8Memory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachegetUint8Memory0;
}

function getStringFromWasm0(ptr, len) {
    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}

let WASM_VECTOR_LEN = 0;

let cachedTextEncoder = new TextEncoder('utf-8');

const encodeString = (typeof cachedTextEncoder.encodeInto === 'function'
    ? function (arg, view) {
    return cachedTextEncoder.encodeInto(arg, view);
}
    : function (arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
        read: arg.length,
        written: buf.length
    };
});

function passStringToWasm0(arg, malloc, realloc) {

    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length);
        getUint8Memory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len);

    const mem = getUint8Memory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }

    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3);
        const view = getUint8Memory0().subarray(ptr + offset, ptr + len);
        const ret = encodeString(arg, view);

        offset += ret.written;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

let cachegetInt32Memory0 = null;
function getInt32Memory0() {
    if (cachegetInt32Memory0 === null || cachegetInt32Memory0.buffer !== wasm.memory.buffer) {
        cachegetInt32Memory0 = new Int32Array(wasm.memory.buffer);
    }
    return cachegetInt32Memory0;
}
/**
* @param {string} method
* @param {string} params_json
* @returns {string}
*/
result.request = function(method, params_json) {
    try {
        var ptr0 = passStringToWasm0(method, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ptr1 = passStringToWasm0(params_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        wasm.request(8, ptr0, len0, ptr1, len1);
        var r0 = getInt32Memory0()[8 / 4 + 0];
        var r1 = getInt32Memory0()[8 / 4 + 1];
        return getStringFromWasm0(r0, r1);
    } finally {
        wasm.__wbindgen_free(r0, r1);
    }
}

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}

function getArrayU8FromWasm0(ptr, len) {
    return getUint8Memory0().subarray(ptr / 1, ptr / 1 + len);
}

result.__wbindgen_object_drop_ref = function(arg0) {
    takeObject(arg0);
};

result.__wbg_randomFillSync_1b52c8482374c55b = function(arg0, arg1, arg2) {
    getObject(arg0).randomFillSync(getArrayU8FromWasm0(arg1, arg2));
};

result.__wbg_getRandomValues_1ef11e888e5228e9 = function(arg0, arg1, arg2) {
    getObject(arg0).getRandomValues(getArrayU8FromWasm0(arg1, arg2));
};

result.__wbg_new_3a746f2619705add = function(arg0, arg1) {
    var ret = new Function(getStringFromWasm0(arg0, arg1));
    return addHeapObject(ret);
};

result.__wbg_call_f54d3a6dadb199ca = function(arg0, arg1) {
    var ret = getObject(arg0).call(getObject(arg1));
    return addHeapObject(ret);
};

result.__wbindgen_jsval_eq = function(arg0, arg1) {
    var ret = getObject(arg0) === getObject(arg1);
    return ret;
};

result.__wbg_self_ac379e780a0d8b94 = function(arg0) {
    var ret = getObject(arg0).self;
    return addHeapObject(ret);
};

result.__wbg_crypto_1e4302b85d4f64a2 = function(arg0) {
    var ret = getObject(arg0).crypto;
    return addHeapObject(ret);
};

result.__wbindgen_is_undefined = function(arg0) {
    var ret = getObject(arg0) === undefined;
    return ret;
};

result.__wbg_getRandomValues_1b4ba144162a5c9e = function(arg0) {
    var ret = getObject(arg0).getRandomValues;
    return addHeapObject(ret);
};

result.__wbg_require_6461b1e9a0d7c34a = function(arg0, arg1) {
    var ret = require(getStringFromWasm0(arg0, arg1));
    return addHeapObject(ret);
};

result.__wbg_getTime_cf70180ac23e225e = function(arg0) {
    var ret = getObject(arg0).getTime();
    return ret;
};

result.__wbg_new0_ec4525550bb7b3c8 = function() {
    var ret = new Date();
    return addHeapObject(ret);
};

result.__wbindgen_throw = function(arg0, arg1) {
    throw new Error(getStringFromWasm0(arg0, arg1));
};

   return result;
})()

self.onmessage = (e) => {
    const message = e.data;
    const setup = message.setup;
    if (setup) {
        (async () => {
            const instance = (await WebAssembly.instantiate(setup.wasmModule, {
                './ton_client_web.js': wasmWrapper
            })).exports;
            wasmWrapper.setup(instance);
            postMessage({
                setup: {}
            })
        })();
        return;
    }
    const request = message.request;
    if (request) {
        const result = wasmWrapper.request(request.method, request.params);
        postMessage({
            response: {
                id: request.id,
                result,
            }
        });
    }
};
`;


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
                callback('"0.19.1"', '');
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
