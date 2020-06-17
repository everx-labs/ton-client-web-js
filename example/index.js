import { TONClient, setWasmOptions } from 'ton-client-web-js';

function debugLog(message) {
    document.body.insertAdjacentHTML("beforeend", `<p>${message}</p>`);
}

window.addEventListener('load', () => {
    (async () => {
        setWasmOptions({
            debugLog,
        });
        let createStart = Date.now();
        const client = await TONClient.create({
            servers: ['net.ton.dev']
        });
        debugLog(`Client creation time: ${(Date.now() - createStart)}`);
        debugLog(`Client uses binary version: ${await client.config.getVersion()}`);
        debugLog(`Client connected to: ${await client.config.data.servers}`);
        const queryStart = Date.now();
        const accounts = await client.queries.accounts.query({}, 'id balance(format:DEC)', [{path:'balance', direction:'DESC'}], 10);
        debugLog(`Query time: ${(Date.now() - queryStart)}`);
        debugLog(`<table>${accounts.map(x => `<tr><td>${x.id}</td><td>${x.balance}</td></tr>`).join('')}</table>`);
        debugLog(`Now is: ${new Date()}`);
        debugLog(`sha512: ${await client.crypto.sha512({text:'text'})}`);
        debugLog(`random: ${await client.crypto.randomGenerateBytes(12)}`);
    })();
});
