import {initTONClient as initTC} from 'ton-client-web-js';
import * as j from 'jest-lite';
// import {Buffer as buffer} from 'buffer';
// import * as p1 from 'error-polyfill';
// import * as p2 from 'react-native-console-time-polyfill';
// import bigInt from 'big-integer';
import assets from './assets';

// if (!global.BigInt) {
//     global.BigInt = bigInt;
// }
// if (!global.Buffer) {
//     global.Buffer = buffer;
// }

global.jest = j;
['test', 'expect', 'afterAll', 'afterEach', 'beforeAll', 'beforeEach'].forEach((name) => {
    global[name] = j[name];
})

jest.test.each = variants => (title, fn) => variants.forEach((v) => {
    jest.test(title.replace(/%i/g, v), () => fn(v));
});

const testTimeoutSymbol = Symbol.for('TEST_TIMEOUT_SYMBOL');
jest.setTimeout = (timeout) => {
    global[testTimeoutSymbol] = timeout;
};

j.setTimeout(200000);

// platform

async function findGiverKeys() {
    return null;
}

async function writeGiverKeys(keys) {
}

function createJaegerTracer(endpoint) {
    return null;
}

async function initTONClient(tonClientClass) {
    return initTC(tonClientClass);
}

async function loadContractPackage(name, version) {
    const contract = assets.contracts[`${name}-${version}`];
    if (!contract) {
        throw new Error(`Contract not found: ${name}-${version}`)
    }
    return contract;
}

const env = assets.env;
export {
    findGiverKeys,
    writeGiverKeys,
    createJaegerTracer,
    initTONClient,
    loadContractPackage,
    env,
};
