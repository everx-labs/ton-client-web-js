import {test as jTest, run as jRun, expect as jExpect} from 'jest-lite';

global.test = jTest;
global.run = jRun;
global.expect = jExpect;

test('aaa', async () => {
    expect(1).toBeTruthy();
});


function debugLog(message) {
    document.body.insertAdjacentHTML("beforeend", `<p>${message}</p>`);
}

window.addEventListener('load', () => {
    (async () => {
        try {
            const results = await run();
            console.log('>>>', results);

            console.log('>>>', '[TEST_COMPLETE]');
        } catch (error) {
            console.log('>>>', '[TEST_FAILED]');
        }
    })();
});
