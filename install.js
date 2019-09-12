const fs = require('fs');
const path = require('path');
const os = require('os');
const https = require('https');
const http = require('http');
const zlib = require('zlib');

const p = os.platform();
const binVersion = process.env.npm_package_binVersion || process.env.npm_package_version;
const bv = binVersion.split('.').join('_');

const root = process.cwd();
const binariesHost = 'sdkbinaries.tonlabs.io';


function downloadAndGunzip(dest, url) {
    return new Promise((resolve, reject) => {

        const request = http.get(url, response => {
            if (response.statusCode !== 200) {
                reject({
                    message: `Download failed with ${response.statusCode}: ${response.statusMessage}`,
                });
                return;
            }
            fs.mkdirSync(path.dirname(path.resolve(dest)), { recursive: true });
            let file = fs.createWriteStream(dest, { flags: "w" });
            let opened = false;
            const failed = (err) => {
                if (file) {
                    file.close();
                    file = null;

                    fs.unlink(dest, () => {
                    });
                    reject(err);
                }
            };

            const unzip = zlib.createGunzip();
            unzip.pipe(file);


            response.pipe(unzip);


            request.on("error", err => {
                failed(err);
            });

            file.on("finish", () => {
                if (opened && file) {
                    resolve();
                }
            });

            file.on("open", () => {
                opened = true;
            });

            file.on("error", err => {
                if (err.code === "EEXIST") {
                    file.close();
                    reject("File already exists");
                } else {
                    failed(err);
                }
            });
        });
    });

}


async function dl(dst, src) {
    const dst_path = `${root}/${dst}`;
    const src_url = `http://${binariesHost}/${src}.gz`;
    process.stdout.write(`Downloading ${dst} from ${binariesHost} ...`);
    await downloadAndGunzip(dst_path, src_url);
    process.stdout.write('\n');
}

function replaceAll(s, pairs) {
    let result = s;
    for (const pair of pairs) {
        result = result.split(pair[0]).join(pair[1]);
    }
    return result;
}

function stringifyScript(s) {
    return replaceAll(s, [
        ['\r', '\\r'],
        ['\n', '\\n'],
        ['\t', '\\t'],
        ['\'', '\\\''],
    ]);
}

async function main() {
    await dl('tonclient.wasm', `tonclient_${bv}_wasm`);
    await dl('tonclient.wasm.js', `tonclient_${bv}_wasm_js`);
    process.chdir(root);
    const worker = stringifyScript(fs.readFileSync(path.join(root, 'worker.js'), 'utf-8'));

    let wasmWrapper = fs.readFileSync(path.join(root, 'tonclient.wasm.js'), 'utf-8');
    wasmWrapper = wasmWrapper.replace(/^import \* as wasm from .*$/gm,
        `(function() {
let wasm = null;
const result = {
    setup: (newWasm) => {
        wasm = newWasm;
    },
};
`);
    wasmWrapper = wasmWrapper.replace(/^export const /gm, 'result.');
    wasmWrapper = wasmWrapper.replace(/^export function (\w+)/gm, 'result.$1 = function');
    wasmWrapper +=
        `   return result;
})()`;
    wasmWrapper = stringifyScript(wasmWrapper);

    const wasmBytes = fs.readFileSync(path.join(root, 'tonclient.wasm'));
    const wasmBase64 = wasmBytes.toString('base64').match(/.{1,1000}/g).join('\', \r\n\'');
    const inlineAssets =
        `const assets = {
            worker: '${worker}',
            wasmWrapper: '${wasmWrapper}',
            wasmBase64: ['${wasmBase64}']
        };
        export default assets;
        `;
    fs.writeFileSync(path.join(root, 'inline-assets.js'), inlineAssets);
    console.log('"inline-assets.js" have generated from "tonclient.wasm", "tonclient.wasm.js" and "worker.js"');
    fs.unlinkSync(path.join(root, 'tonclient.wasm'));
    fs.unlinkSync(path.join(root, 'tonclient.wasm.js'));
}


(async () => {
    try {
        await main();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
})();
