import { assertEquals } from "https://deno.land/std@0.176.0/testing/asserts.ts";
import { chan, closed } from "./csp.ts";

Deno.test("test 1", async () => {
    let c = chan<number>(3);
    await c.put(1);
    await c.put(1);
    await c.put(1);
    await c.pop();
    await c.put(1);
    await c.pop();
    await c.put(1);
    await c.pop();
    await c.pop();
    await c.pop();
    await c.put(1);
    await c.put(1);
    await c.put(1);
    assertEquals(1, 1);
});

Deno.test("test 2", async (t) => {
    let c = chan<number>(1);
    let p1 = (async () => {
        await c.pop();
        await c.pop();
        await c.pop();
    })();
    let p2 = (async () => {
        await c.put(1);
        await c.put(1);
        await c.put(1);
        await c.put(1);
    })();
    await Promise.all([p1, p2]);
    assertEquals(1, 1);

    await t.step("closed buffered channel with elements in buffer", async () => {
        const c = chan(10);
        (async () => {
            await Promise.all([c.put(1), c.put(2), c.put(3)]);
        })();
        await c.close();
        assertEquals(await c.pop(), 1);
        assertEquals(await c.pop(), 2);
        assertEquals(await c.pop(), 3);
        assertEquals(await c.pop(), closed);
    });
});
