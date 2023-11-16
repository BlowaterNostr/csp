// deno-lint-ignore-file no-explicit-any
import { assertEquals } from "https://deno.land/std@0.176.0/testing/asserts.ts";
import { not_cancelled, sleep } from "./csp.ts";

Deno.test("sleep", async () => {
    let t1 = Date.now();
    const isCancelled = await sleep(10);
    let timePassed = Date.now() - t1;
    console.log("time passed", timePassed);
    assertEquals(isCancelled, not_cancelled);
    assertEquals(timePassed >= 10, true);
    // the time passed can't be too late,
    // let's allow a 20 milliseconds latency
    assertEquals(30 >= timePassed, true);

    {
        let t2 = Date.now();
        const isCancelled = await sleep(10, Promise.resolve("cancel"));
        timePassed = Date.now() - t2;
        console.log("time passed", timePassed);
        assertEquals(isCancelled, "cancel");
        // the sleep was 1s, but because it was cancelled immediately,
        // almost no time has passed
        assertEquals(timePassed <= 1, true);
    }
});
