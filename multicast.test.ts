import { assertEquals } from "https://deno.land/std@0.176.0/testing/asserts.ts";
import { chan, multi, sleep } from "./csp.ts";

Deno.test("Multi Cast of Channels", async (t) => {
    await t.step("works", async () => {
        let c = chan();
        let multicaster = multi(c);
        let c1 = multicaster.copy();
        let c2 = multicaster.copy();
        let c3 = multicaster.copy();
        for (let i = 0; i < 100; i++) {
            c.put(i);
            assertEquals(i, await c1.pop());
            assertEquals(i, await c2.pop());
            assertEquals(i, await c3.pop());
        }
        c.close();
        await sleep(0);
        assertEquals(true, c1.closed());
        assertEquals(true, c2.closed());
        assertEquals(true, c3.closed());
    });
});
