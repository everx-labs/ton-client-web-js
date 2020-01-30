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
        debugLog(`Client version: ${await client.config.getVersion()}`);
        debugLog(`Client creation time: ${(Date.now() - createStart)}`);
        const queryStart = Date.now();
        const accounts = await client.queries.accounts.query({}, 'id balance', [{path:'balance', direction:'DESC'}], 10);
        debugLog(`<table>${accounts.map(x => `<tr><td>${x.id}</td><td>${BigInt(x.balance)}</td></tr>`).join('')}</table>`);
        debugLog(`Query time: ${(Date.now() - queryStart)}`);
    })();
});
