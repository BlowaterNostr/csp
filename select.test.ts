import { assertEquals, assertThrows } from "https://deno.land/std@0.176.0/testing/asserts.ts";
import { chan, closed, select, sleep } from "./csp.ts";

Deno.test("select on read/receive/pop operation", async (t) => {
    await t.step("works", async () => {
        let sec1 = chan<string>();
        sec1.put("put after unblock");
        let x = await select([
            [sec1, async (ele) => ele],
        ]);
        assertEquals("put after unblock", x);
    });
    await t.step("works 2", async () => {
        let unblock = chan<null>();
        unblock.close();
        let sec1 = chan<string>();
        let id = setTimeout(async () => {
            sec1.put("sec1");
        }, 1000);
        let x = await select([
            [sec1, async function (ele) {
                return ele;
            }],
            [unblock, async function (ele) {
                return ele;
            }],
        ]);
        assertEquals(closed, x);
        clearTimeout(id);
    });
    await t.step("can select from a channel that will be closed later", async () => {
        let unblock = chan<null>();
        setTimeout(async () => {
            unblock.close();
        }, 100);
        let x = await select([
            [unblock, async function (ele) {
                return ele;
            }],
        ]);
        assertEquals(closed, x);
    });
    await t.step("can select from a channel that will be put later", async () => {
        let unblock = chan<string>();
        setTimeout(async () => {
            unblock.put("put 1 sec later");
        }, 100);
        let x = await select([
            [unblock, async function (ele) {
                return ele;
            }],
        ]);
        assertEquals("put 1 sec later", x);
    });

    await t.step("can pop from unselected channels", async () => {
        let unblock = chan<null>();
        unblock.close();
        let sec1 = chan<string>();
        let t1 = async () => {
            await sleep(100);
            await sec1.put("sec1");
        };
        t1();
        assertEquals(
            "unblock",
            await select([
                [unblock, async function () {
                    return "unblock";
                }],
                [sec1, async function (ele) {
                    return ele;
                }],
            ]),
        );
        assertEquals("sec1", await sec1.pop());
    });

    await t.step("returns in order", async () => {
        let unblock = chan<null>();
        unblock.put(null);
        let sec1 = chan<string>();
        sec1.put("put after unblock");
        let x = await select([
            [sec1, async (ele) => ele],
            // [unblock, async () => 'unblock' ]
        ]);
        assertEquals("put after unblock", x);
    });

    // todo: schedule fairness / effectiveness
    // xawait t.step(
    //     "favors channels with values ready to be received over closed channels",
    //     async () => {
    //         // Currently does not support, but
    //         // Is this even a good design decision?
    //         let unblock = chan<null>();
    //         unblock.close();
    //         let sec1 = chan<null>();
    //         sec1.put(null);
    //         let x = await select([
    //             [sec1, async function () {
    //                 return "sec1";
    //             }],
    //             [unblock, async function () {
    //                 return "unblock";
    //             }],
    //         ]);
    //         assertEquals("sec1", x);
    //     },
    // );

    // xawait t.step("fair selections --> no starvation", async () => {
    //     // Currently does not support, but
    //     // Is this even a good design decision?
    //     let unblock = chan<null>();
    //     unblock.close();
    //     let sec1 = chan<null>();
    //     sec1.put(null);
    //     while (1) {
    //         let x = await select([
    //             [unblock, async function () {
    //                 return "unblock";
    //             }],
    //             [sec1, async function () {
    //                 return "sec1";
    //             }],
    //         ]);
    //         if ("sec1" === x) { // should eventually get picked
    //             break;
    //         }
    //     }
    // });

    await t.step("has default case", async () => {
        let unblock = chan<null>();
        assertEquals(
            "default",
            await select(
                [
                    [unblock, async function () {
                        return "unblock";
                    }],
                ],
                async function () {
                    return "default";
                },
            ),
        );
    });
    await t.step("won't trigger default case if the normal case is ready", async () => {
        let unblock = chan<null>();
        unblock.close();
        assertEquals(
            await select(
                [
                    [unblock, async function () {
                        return "unblock";
                    }],
                ],
                async function () {
                    return "default";
                },
            ),
            "unblock",
        );
        // @ts-ignore access private
        assertEquals(0, unblock.popActions.length);
        // @ts-ignore access private
        assertEquals(0, unblock.putActions.length);
        // @ts-ignore access private
        assertEquals(0, unblock.readyListener.length);
    });
    await t.step("won't trigger default case if the normal case is ready 2", async () => {
        let unblock = chan<string>();
        unblock.put("something");
        assertEquals(
            await select(
                [
                    [unblock, async function (ele) {
                        return ele;
                    }],
                ],
                async function () {
                    return "default";
                },
            ),
            "something",
        );
    });
});
