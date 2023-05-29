// deno-lint-ignore-file no-explicit-any
import { assertEquals } from "https://deno.land/std@0.176.0/testing/asserts.ts";
import { semaphore, sleep } from "./csp.ts";

Deno.test("semaphore 1", async () => {
    const s = semaphore(1);
    await s(() => {});
});

Deno.test("semaphore 3", async () => {
    const s = semaphore(3);
    const ps: any[] = [];
    for (let i = 0; i < 9; i++) {
        const p = s(async () => {
            await sleep(0);
            return i;
        });
        ps.push(p);
    }
    assertEquals(ps.length, 9);
    let i = 0;
    for (const p of ps) {
        assertEquals(await p, i);
        i++;
    }
});
