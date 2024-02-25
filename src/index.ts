import type { Server, SocketAddress } from "bun"
import { Router } from "./router"

/**
 * Torchflower is an http server built on top of bun's `Bun.serve`, making it blazingly fast and a joy to use.
 * ```ts
 * import Torchflower from "torchflower"
 *
 * const app = new Torchflower()
 *
 * app.get("/", () => new Response("Hello, World!"))
 *
 * app.serve(3000, () => console.log("Serving on port 3000!"))
 * ```
 *
 * Torchflower also implements a runtime type checker, which makes it extremely easy to validate packets!
 * ```ts
 * import { guard } from "torchflower"
 *
 * const is_priority = guard.or(
 *     guard.string_literal("Critical"),
 *     guard.or(guard.string_literal("Medium"), guard.string_literal("Low"))
 * )
 *
 * const is_task = guard.check(
 *     guard.record((value) => {
 *         return {
 *             name: guard.string(value.name),
 *             priority: is_priority(value.priority),
 *         }
 *     })
 * )
 *
 * app.post("/task", async (req) => {
 *     const metadata = task(await req.json())
 *     if (!metadata) return new Response("400 Bad Request")
 *
 *     console.log("--- New task received!")
 *     console.table(metadata)
 *
 *     return new Response("200 OK")
 * })
 * ```
 * Not only will you notice that you get autocompletion for the body upon validation, but also that if you pass an invalid body - be it invalid types or missing fields - "400 Bad Request" will be returned!\
 * Note though, that the app will error if using runtime type checking *without* wrapping your check in `guard.check()`.
 */
export default class Torchflower {
    private router: Router = new Router()
    private error_handler = async (_: Error): Promise<Response> => {
        return new Response(`500 Internal Server Error`, {
            status: 500,
            statusText: "Internal Server Error",
        })
    }
    private server: Server | undefined = undefined
    public listening: boolean = false

    /**
     * Sets the app's error handler to the passed callback.\
     * ⚠️ Note: The error handler can only be set prior to calling `app.listen`!
     * @param handler Error handler
     */
    public set_error_handler(handler: (error: Error) => Promise<Response>) {
        if (!this.listening) return
        this.error_handler = handler
    }

    /**
     * Begins to serve the application on the given port.
     * @param port Port to listen on
     * @param on Callback fired upon the server starting to listen
     */
    public serve(port: number = 3000, on: () => void) {
        const handle = async (req: Request) => this.router.handle(req)

        this.server = Bun.serve({
            port: port,
            fetch(req) {
                return handle(req)
            },
            error: this.error_handler,
        })

        this.listening = true

        on()
    }

    /**
     * Requests the IP of the client making the request.
     * @param req Request
     * @returns IP Address / null
     */
    public request_ip(req: Request): SocketAddress | null {
        return (this.server && this.server.requestIP(req)) || null
    }

    /**
     * Listens to GET requests on the given route. Handlers are asynchronous by default.
     * @param route Route
     * @param callback Handler
     */
    public get(route: string, handler: (req: Request) => Promise<Response>) {
        this.router.route("GET", route, handler)
    }

    /**
     * Listens to HEAD requests on the given route. Handlers are asynchronous by default.
     * @param route Route
     * @param callback Handler
     */
    public head(route: string, handler: (req: Request) => Promise<Response>) {
        this.router.route("HEAD", route, handler)
    }

    /**
     * Listens to POST requests on the given route. Handlers are asynchronous by default.
     * @param route Route
     * @param callback Handler
     */
    public post(route: string, handler: (req: Request) => Promise<Response>) {
        this.router.route("POST", route, handler)
    }

    /**
     * Listens to PUT requests on the given route. Handlers are asynchronous by default.
     * @param route Route
     * @param callback Handler
     */
    public put(route: string, handler: (req: Request) => Promise<Response>) {
        this.router.route("PUT", route, handler)
    }

    /**
     * Listens to DELETE requests on the given route. Handlers are asynchronous by default.
     * @param route Route
     * @param callback Handler
     */
    public delete(route: string, handler: (req: Request) => Promise<Response>) {
        this.router.route("DELETE", route, handler)
    }

    /**
     * Listens to PATCH requests on the given route. Handlers are asynchronous by default.
     * @param route Route
     * @param callback Handler
     */
    public patch(route: string, handler: (req: Request) => Promise<Response>) {
        this.router.route("PATCH", route, handler)
    }
}

export * as guard from "./guard"
