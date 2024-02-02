import Torchflower, { guard } from "../src"

const app = new Torchflower()

app.get("/", async (req) => {
    return new Response("Hello, World!")
})

const task = guard.check(
    guard.record((value) => {
        return {
            name: guard.string(value.name),
            priority: guard.or(
                guard.string_literal("Critical"),
                guard.or(
                    guard.string_literal("Medium"),
                    guard.string_literal("Low")
                )
            )(value.priority),
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

app.serve(3000, () => console.log("Listening on port 3000!"))
