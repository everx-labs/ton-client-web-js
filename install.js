const fs = require('fs');
const path = require('path');
const http = require('http');
const zlib = require('zlib');

const v = process.env.npm_package_version.split('.');
const binariesVersion = `${v[0]}.${v[1]}.${~~(Number.parseInt(v[2]) / 100) * 100}`;
const bv = binariesVersion.split('.').join('_');

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

function scriptToStringLiteral(s) {
    return `\`${s.split('`').join('\\``')}\``;
}

function getTemplate(name) {
    const template = fs.readFileSync(path.join(root, name), 'utf-8').split('//---');
    if (template.length > 1) {
        template.shift();
    }
    return template.join('');
}

function getWasmWrapperScript() {
    let script = fs.readFileSync(path.join(root, 'tonclient.wasm.js'), 'utf-8');
    script = script.replace(/^import \* as wasm from .*$/gm,
        `
const wasmWrapper = (function() {
let wasm = null;
const result = {
    setup: (newWasm) => {
        wasm = newWasm;
    },
};
`);
    script = script.replace(/^export const /gm, 'result.');
    script = script.replace(/^export function (\w+)/gm, 'result.$1 = function');
    script +=
        `   return result;
})()`;
    return script;
}

function getWorkerScript() {
    return [
        getWasmWrapperScript(),
        getTemplate('worker-template.js')
    ].join('\n');
}

function getIndexScript() {
    const workerScript = getWorkerScript();
    return [
        `const workerScript = ${scriptToStringLiteral(workerScript)};`,
        getTemplate('index-template.js')
    ].join('\n');
}

async function main() {
    // await dl('tonclient.wasm', `tonclient_${bv}_wasm`);
    await dl('tonclient.wasm.js', `tonclient_${bv}_wasm_js`);
    process.chdir(root);

    let indexScript = getIndexScript();
    fs.writeFileSync(path.join(root, 'index.js'), indexScript);

    console.log('"index.js" have generated from "index-template.js" and "worker-template.js"');
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
