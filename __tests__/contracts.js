//import { TONClient } from './../index';


describe('Google', () => {
    beforeEach(async () => {
        await page.goto(PATH, { waitUntil: 'load' })
    })

    it('Should open WASM TonClient', async () => {

        console.log(await page.content());

    });
});
