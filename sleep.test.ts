// deno-lint-ignore-file no-explicit-any
import { assertEquals } from "https://deno.land/std@0.176.0/testing/asserts.ts";
import { sleep } from "./csp.ts";

Deno.test("sleep", async () => {
    let t1 = Date.now();
    let isCancelled = await sleep(10);
    let timePassed = Date.now() - t1;
    console.log("time passed", timePassed);
    assertEquals(isCancelled, false);
    assertEquals(timePassed >= 10, true);
    // the time passed can't be too late,
    // let's allow a 20 milliseconds latency
    assertEquals(30 >= timePassed, true);

    let t2 = Date.now();
    isCancelled = await sleep(10, Promise.resolve());
    timePassed = Date.now() - t2;
    console.log("time passed", timePassed);
    assertEquals(isCancelled, true);
    // the sleep was 1s, but because it was cancelled immediately,
    // almost no time has passed
    assertEquals(timePassed <= 1, true);
});
