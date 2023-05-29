// deno-lint-ignore-file no-explicit-any
import { chan } from "./csp.ts";
import { assertEquals } from "https://deno.land/std@0.176.0/testing/asserts.ts";

Deno.test("could close with a reason", async () => {
    const c1 = chan<void>();
    await c1.close("reason");
    assertEquals(c1.closed(), "reason");

    const c2 = chan<void>();
    await c2.close();
    assertEquals(c2.closed(), true);

    const c3 = chan<void>();
    await c3.close("");
    assertEquals(c3.closed(), true);
});
