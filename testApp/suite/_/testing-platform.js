import { initTONClient as initTC } from 'ton-client-web-js';
import * as jestLite from 'jest-lite';
import { Buffer as buffer } from 'buffer';
import * as p1 from 'error-polyfill';
// import * as p2 from 'react-native-console-time-polyfill';
import { BigInteger as bigInt } from 'javascript-biginteger';
import assets from './assets';

if (bigInt && !global.BigInt) {
    global.BigInt = bigInt;
}
if (buffer && !global.Buffer) {
    global.Buffer = buffer;
}

global.jest = jestLite.jest;
['test', 'expect', 'afterAll', 'afterEach', 'beforeAll', 'beforeEach'].forEach((name) => {
    jestLite.jest[name] = jestLite[name];
    global[name] = jestLite[name];
});

['addEventHandler', 'run'].forEach((name) => {
    jestLite.jest[name] = jestLite[name];
});

jest.test.each = variants => (title, fn) => variants.forEach((v) => {
    jest.test(title.replace(/%i/g, v), () => fn(v));
});

const testTimeoutSymbol = Symbol.for('TEST_TIMEOUT_SYMBOL');
jest.setTimeout = (timeout) => {
    global[testTimeoutSymbol] = timeout;
};

jestLite.jest.setTimeout(200000);

function isBigInt(a) {
    return typeof a === 'bigint' || a instanceof BigInt;
}

function compareBigInt(a, b) {
    const bigA = BigInt(a);
    const bigB = BigInt(b);
    if (typeof bigA !== 'bigint') {
        return bigA.compare(bigB);
    }
    if (bigA < bigB) {
        return -1;
    }
    if (bigA > bigB) {
        return 1;
    }
    return 0;
}

const bigIntMatchers = {
    toBeGreaterThan(received, other) {
        return {
            pass: compareBigInt(received, other) > 0,
            message: () => `${received} must be greater than ${other}`,
        };
    },
    toBeGreaterThanOrEqual(received, other) {
        return {
            pass: compareBigInt(received, other) >= 0,
            message: () => `${received} must be greater than or equal to ${other}`,
        };
    },
    toBeLessThan(received, other) {
        return {
            pass: compareBigInt(received, other) < 0,
            message: () => `${received} must be less than ${other}`,
        }
    },
    toBeLessThanOrEqual(received, other) {
        return {
            pass: compareBigInt(received, other) <= 0,
            message: () => `${received} must be less than or equal to ${other}`,
        }
    },
    toEqual(received, other) {
        return {
            pass: compareBigInt(received, other) === 0,
            message: () => `${received} must be equal to ${other}`,
        }
    },
    // toBe: null,
    // toBeCloseTo: null,
    // toBeDefined: null,
    // toBeFalsy: null,
    // toBeInstanceOf: null,
    // toBeNaN: null,
    // toBeNull: null,
    // toBeTruthy: null,
    // toBeUndefined: null,
    // toContain: null,
    // toContainEqual: null,
    // toHaveLength: null,
    // toHaveProperty: null,
    // toMatch: null,
    // toMatchObject: null,
    // lastCalledWith: null,
    // toBeCalled: null,
    // toBeCalledWith: null,
    // toHaveBeenCalled: null,
    // toHaveBeenCalledTimes: null,
    // toHaveBeenCalledWith: null,
    // toHaveBeenLastCalledWith: null,
    // toThrow: null,
    // toThrowError: null,
};
const defaultExpect = jestLite.jest.expect;
global.expect = jestLite.jest.expect = (received) => {
    const wrapped = defaultExpect(received);
    if (isBigInt(received)) {
        Object.entries(bigIntMatchers).forEach(([name, fn]) => {
            wrapped[name] = (...args) => fn(received, ...args);
        })
    }
    return wrapped;
}


// platform

async function findGiverKeys() {
    return assets.giverKeys;
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
