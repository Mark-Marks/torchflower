# Torchflower

Torchflower is an http server built on top of bun's `Bun.serve`, making it blazingly fast and a joy to use.

## Installation

Torchflower is only available to use with `bun`.

```sh
bun add git@github.com:mark-marks/torchflower.git
```

## Hello, World!

```ts
import Torchflower from "torchflower"

const app = new Torchflower()

app.get("/", () => new Response("Hello, World!"))

app.serve(3000, () => console.log("Serving on port 3000!"))
```

## Packet validation

Torchflower also implements a runtime type checker, which makes it extremely easy to validate packets!

```ts
import { guard } from "torchflower"

const is_priority = guard.or(
    guard.string_literal("Critical"),
    guard.or(guard.string_literal("Medium"), guard.string_literal("Low"))
)

const is_task = guard.check(
    guard.record((value) => {
        return {
            name: guard.string(value.name),
            priority: is_priority(value.priority),
        }
    })
)

app.post("/task", async (req) => {
    const metadata = task(await req.json())
    if (!metadata) return new Response("400 Bad Request")

    console.log("--- New task received!")
    console.table(metadata)

    return new Response("200 OK")
})
```

Not only will you notice that you get autocompletion for the body upon validation, but also that if you pass an invalid body - be it invalid types or missing fields - "400 Bad Request" will be returned!\
 Note though, that the app will error if using runtime type checking withoutwrapping your check in `guard.check()`.
