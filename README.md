# [Communicating Sequential Process](https://www.cs.cmu.edu/~crary/819-f09/Hoare78.pdf) in All of JavaScript
A **zero-dependency** ES module that implements CSP style concurrency in Browser, Node and Deno.

The implementation is mapped to Go's channel semantics as close as possible unless the nature of JS advices otherwise.

## Install
```ts
import * as csp from "https://raw.githubusercontent.com/BlowaterNostr/csp/master/csp.ts"
```

## Document
Please refer to tests.

## Why?
My motivation of writing it is not merely an intellectual pursue of reinventing the wheel, considering there are already at least 3 implementations of CSP in JavaScript.

I need a robust concurreny model that works great both in a single process and across the network. I also want to use the "new" [async iterable iterator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of) added to JavaScript since es2018 and use TypeScript for delightful library authoring & consumption.


None of the previous CSP implementations in JS meets my requirement so that I have to implement my own. It's faster, safer, more robust in both my development happiness and runtime efficiency.

### CSP vs Actor
After much research, I have chosen CSP over Actor Model because

1. CSP can be used for coordination.
2. CSP works better in a single-process situation.
3. Go & Clojure has native & robust CSP so that I can have a reference.

### What about RxJS?
Reactive programming itself is good. But `RxJS` is a terrible implementation. Its API is bloated. It is terribly slow. It's hard to learn and use.

With 300 lines of code, `csp.ts` achieves the same goal as `RxJS` but smaller, faster, simpler.

CSP makes reactive programming great again.
