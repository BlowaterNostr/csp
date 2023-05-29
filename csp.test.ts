import { assertEquals } from "https://deno.land/std@0.176.0/testing/asserts.ts";
import { chan, closed, PutToClosedChannelError, select, sleep, UnreachableError } from "./csp.ts";

Deno.test("Channel", async (t) => {
    await t.step("can read in order", async () => {
        let c = chan<number>();
        let task1 = async () => {
            let i = 0;
            while (1) {
                await c.put(++i);
                await c.put(++i);
            }
        };
        let task2 = async () => {
            let data: (number | symbol)[] = [];
            let i = 0;
            while (i++ < 10) {
                let x = await c.pop();
                data.push(x);
            }
            return data;
        };
        let t1 = task1();
        let t2 = task2();
        assertEquals(await t2, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    });

    await t.step("supports iteration protocol", async () => {
        let c = chan<number>();
        let task1 = async () => {
            let i = 0;
            while (1) {
                await c.put(++i);
                await c.put(++i);
            }
        };
        let task2 = async () => {
            let data: (number | symbol)[] = [];
            let i = 0;
            for await (let x of c) {
                i++;
                data.push(x);
                if (i === 10) {
                    break;
                }
            }
            assertEquals(data, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        };
        let t1 = task1();
        let t2 = task2();
        await t2;
    });

    await t.step("close always returns undefined", async () => {
        let c = chan<number>();
        let task1 = async () => {
            await c.close();
        };
        let task2 = async () => {
            let data: (number | symbol)[] = [];
            let x = await c.pop();
            data.push(x);
            x = await c.pop();
            data.push(x);
            x = await c.pop();
            data.push(x);
            return data;
        };
        let t2 = task2();
        await task1();
        assertEquals(await t2, [closed, closed, closed]);
    });

    await t.step("close works with put", async () => {
        let c = chan<number>();
        let task1 = async () => {
            await c.put(1);
            await c.close();
        };
        let task2 = async () => {
            let data: (number | symbol)[] = [];
            let x = await c.pop();
            data.push(x);
            x = await c.pop();
            data.push(x);
            return data;
        };
        let t1 = task1();
        let t2 = task2();
        await t1;
        assertEquals(await t2, [1, closed]);
    });

    await t.step("close works with iterator", async () => {
        let c = chan<number>();
        let t1 = async () => {
            await c.put(1);
            await c.put(2);
            await c.close();
        };
        t1();
        let task2 = async () => {
            let data: (number | undefined)[] = [];
            for await (let x of c) {
                data.push(x);
            }
            return data;
        };
        let t2 = task2();
        await t1;
        assertEquals(await t2, [1, 2]);
    });

    await t.step("can have concurrent pending put operations", async () => {
        let c = chan<number>();
        let task1 = async () => {
            let p1 = c.put(1);
            let p2 = c.put(2);
            await p1;
            await p2;
            c.close();
        };
        let task2 = async () => {
            let data: (number | undefined)[] = [];
            for await (let x of c) {
                data.push(x);
            }
            return data;
        };
        let t1 = task1();
        let t2 = task2();
        await t1;
        let r = await t2;
        assertEquals(r, [1, 2]);
    });

    await t.step("can have concurrent pending pop operations", async () => {
        let c = chan<number>();
        let task1 = async () => {
            let p1 = c.put(1);
            let p2 = c.put(2);
            await p1;
            await p2;
            c.close();
        };
        let task2 = async () => {
            let data: (Promise<number | symbol> | undefined)[] = [];
            for (let i = 0; i < 2; i++) {
                data.push(c.pop());
            }
            let ds: any[] = [];
            for (let d of data) {
                ds.push(await d);
            }
            return ds;
        };
        let t2 = task2();
        let t1 = task1();
        await t1;
        let r = await t2;
        assertEquals(r, [1, 2]);
    });

    await t.step("close while having pending put actions", async () => {
        const c = chan();
        (async () => {
            let err = await c.put(1);
            assertEquals(true, err instanceof PutToClosedChannelError);
        })();
        await sleep(10);
        await c.close();
    });
});

Deno.test("wait until ready", async () => {
    let c = chan();
    c.put(0);
    await c.ready();
    await c.close();
    await c.ready();

    let c2 = chan(1);
    c2.put(0);
    await c2.ready();
    c2.pop();
    assertEquals(c2.isReadyToPop(), false);
});
