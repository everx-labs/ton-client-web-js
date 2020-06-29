const fs = require('fs');
const path = require('path');
const http = require('http');
const zlib = require('zlib');
const {version} = require('./package.json');

const bv = process.env.TON_SDK_BIN_VERSION || (version).split('.')[0];

const root = process.cwd();
const binariesHost = 'sdkbinaries-ws.tonlabs.io';


function downloadAndGunzip(dest, url) {
    return new Promise((resolve, reject) => {

        const request = http.get(url, response => {
            if (response.statusCode !== 200) {
                reject({
                    message: `Download from ${url} failed with ${response.statusCode}: ${response.statusMessage}`,
                });
                return;
            }
            fs.mkdirSync(path.dirname(path.resolve(dest)), {recursive: true});
            let file = fs.createWriteStream(dest, {flags: "w"});
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
    process.stdout.write(`Downloading from ${src_url} to ${dst_path} ...`);
    await downloadAndGunzip(dst_path, src_url);
    process.stdout.write('\n');
}

async function main() {
    await dl('tonclient.wasm', `tonclient_${bv}_wasm`);
    await dl('index.js', `tonclient_${bv}_wasm_js`);
}


(async () => {
    try {
        await main();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
})();
