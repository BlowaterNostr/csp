// deno-lint-ignore-file no-explicit-any
import { chan, merge } from "./csp.ts";
import { assertEquals } from "https://deno.land/std@0.176.0/testing/asserts.ts";

Deno.test("close merged channel", async () => {
    const c1 = chan<void>();
    const c2 = chan<void>();
    let failed = false;
    (async () => {
        await c1.put();
        failed = true;
    })();
    (async () => {
        await c2.put();
        failed = true; // if successfully reach this line, fail the test
    })();
    const merged = merge<void>(c1, c2);
    await merged.close();
    assertEquals(failed, false);
});

Deno.test("consume 2 elements from 3 sources", async () => {
    const c1 = chan<string>();
    const c2 = chan<string>();
    const c3 = chan<string>();
    let failed = false;
    (async () => {
        await c1.put("1a");
    })();
    (async () => {
        await c2.put("2a");
    })();
    (async () => {
        let res = await c3.put("3a");
        assertEquals(await c3.pop(), "3a"); // element is put back by merge because it was closed.
    })();
    const merged = merge<string>(c1, c2, c3);
    assertEquals(await merged.pop(), "1a");
    assertEquals(await merged.pop(), "2a");
    await merged.close();
});
