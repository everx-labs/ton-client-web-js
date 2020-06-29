const os = require('os');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const srcTestsPath = path.resolve(__dirname, 'node_modules', 'ton-client-js', '__tests__');
const dstTestsPath = path.resolve(__dirname, 'suite');
const coreSourcePath = path.resolve(__dirname, '..', '..', 'TON-SDK', 'ton_client');
const runEnv = {
    ...process.env,
    TC_BIN_SRC: path.resolve(coreSourcePath, 'platforms', 'ton-client-react-native', 'build'),
};

function run(name, ...args) {
    return new Promise((resolve, reject) => {
        try {
            const spawned = spawn(name, args, {
                env: runEnv,
            });
            const errors = [];
            const output = [];

            spawned.stdout.on('data', function (data) {
                output.push(data);
                process.stdout.write(data);
            });

            spawned.stderr.on('data', (data) => {
                errors.push(data);
                process.stderr.write(data.toString());
            });

            spawned.on('error', (err) => {
                reject(err);
            });

            spawned.on('close', (code) => {
                if (code === 0) {
                    resolve(output.join(''));
                } else {
                    reject(errors.join(''));
                }
            });
        } catch (error) {
            reject(error);
        }
    });
}

function replaceLocalhost(address) {
    const ipv4 = Object.values(os.networkInterfaces())
        .reduce((acc, x) => acc.concat(x), [])
        .find(x => x.family === 'IPv4' && !x.internal);
    const ip = ipv4 && ipv4.address;
    return address
        .replace(/(.*\D)?0\.0\.0\.0(\D.*)?/g, `$1${ip}$2`)
        .replace(/(.*\D)?localhost(\D.*)?/g, `$1${ip}$2`)
}

function extIs(file, ext) {
    return path.extname(file).toLowerCase() === ext;
}

function getTgzNames() {
    return fs.readdirSync(__dirname).filter(x => extIs(x, '.tgz'));
}

function copyTestSuiteFile(source, targetDir, convert) {
    const target = path.resolve(targetDir, path.basename(source));
    const content = convert(source, fs.readFileSync(source));
    if (content !== null && content !== undefined) {
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }
        fs.writeFileSync(target, content);
    }
}

function copyTestSuiteFolder(sourceDir, targetDir, convert) {
    fs.readdirSync(sourceDir).forEach((file) => {
        const source = path.resolve(sourceDir, file);
        if (fs.lstatSync(source).isDirectory()) {
            copyTestSuiteFolder(source, path.resolve(targetDir, file), convert);
        } else {
            copyTestSuiteFile(source, targetDir, convert);
        }
    });
}

function replaceSection(filePath, section, content) {
    const sectionMatch = new RegExp(`(\/\/${section})[^]*(\/\/${section})`, 'g');
    const script = fs.readFileSync(filePath, { encoding: 'utf8' }).toString()
        .replace(sectionMatch, `$1\n${content}\n$2`);
    fs.writeFileSync(filePath, script, { encoding: 'utf8' });

}

function rewriteRunScript() {
    const imports = [];
    fs.readdirSync(srcTestsPath).forEach((file) => {
        if (extIs(file, '.js')) {
            imports.push(`import ${file.slice(0, -3).replace(/-/g, '_')}_suite from '../${file}';`);
        }
    });

    const assets = [
        `export default {`,
        `    env: {`,
        `        USE_NODE_SE: '${process.env.USE_NODE_SE || 'true'}',`,
        `        TON_NETWORK_ADDRESS: '${replaceLocalhost(process.env.TON_NETWORK_ADDRESS || 'http://0.0.0.0:8080')}',`,
        `    },`,
        `    contracts: {`,
    ];
    const collectContracts = (abiVersion) => {
        const dir = path.resolve(srcTestsPath, 'contracts', `abi_v${abiVersion}`);
        fs.readdirSync(dir).forEach((file) => {
            if (!extIs(file, '.tvc')) {
                return;
            }
            const name = file.slice(0, -4);
            const abi = path.resolve(dir, `${name}.abi.json`);
            const tvc = path.resolve(dir, `${name}.tvc`);
            assets.push(
                `        '${name}-${abiVersion}': {`,
                `            abi: ${fs.readFileSync(abi, 'utf8').trim().split('\n').join('').split('\t').join('')},`,
                `            imageBase64: '${fs.readFileSync(tvc).toString('base64')}',`,
                `        },`,
            );
        });
    };
    [1, 2].forEach((abiVersion) => {
        collectContracts(abiVersion);
    });
    assets.push(
        '    },',
        '};',
    );
    replaceSection(path.resolve(dstTestsPath, '_', 'run.js'), 'IMPORTS', imports.join('\n'));
    fs.writeFileSync(path.resolve(dstTestsPath, '_', 'assets.js'), assets.join('\n'), { encoding: 'utf8' });
}

function copyTestSuite() {
    copyTestSuiteFolder(srcTestsPath, dstTestsPath, (srcPath, content) => {
        const name = path.basename(srcPath);
        const skipFile = !extIs(name, '.js')
            || name.toLowerCase() === 'testing-platform.js';
        if (skipFile) {
            return null;
        }
        const converted = content.toString()
            .replace(/(from\s+["'])\.\.\/\.\.(\/src\/)/gm, '$1ton-client-js$2')
            .replace(/(from\s+["'])\.\.(\/src\/)/gm, '$1ton-client-js$2')
            .replace(/(from\s+["'])\.\.\/\.\.(\/types)/gm, '$1ton-client-js$2')
            .replace(/(from\s+["'])\.\.(\/types)/gm, '$1ton-client-js$2')
            .replace(/_000/gm, '000');
        return Buffer.from(converted, 'utf8');
    });
    rewriteRunScript();
}


(async () => {
    for (const tgz of getTgzNames()) {
        console.log('Remove ', tgz);
        fs.unlinkSync(path.resolve(__dirname, tgz));
    }
    if (fs.existsSync(path.resolve(__dirname, '..', '..', 'ton-client-js'))) {
        await run('npm', 'pack', '../../ton-client-js');
    }
    await run('npm', 'pack', '../');
    for (const tgz of getTgzNames()) {
        console.log('Install ', tgz);
        await run('npm', 'install', tgz, '--no-save', '--force');
        console.log('Remove ', tgz);
        fs.unlinkSync(path.resolve(__dirname, tgz));
    }

    copyTestSuite();
})();


