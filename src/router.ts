export type Method = "GET" | "HEAD" | "POST" | "PUT" | "DELETE" | "PATCH"
type InnerRoutes = Map<string, (req: Request) => Promise<Response>>
type OuterRoutes = Map<Method, InnerRoutes>

export class Router {
    private routes: OuterRoutes = new Map()

    public route(
        method: Method,
        route: string,
        handler: (req: Request) => Promise<Response>
    ): boolean {
        if (!this.routes.has(method)) this.routes.set(method, new Map())
        const routes = this.routes.get(method)!

        if (routes.has(route)) return false

        routes.set(route, handler)

        return true
    }

    public async handle(req: Request): Promise<Response> {
        const routes = this.routes.get(req.method as any)
        if (!routes) return new Response("404 INVALID")

        const url = new URL(req.url)
        if (!routes.has(url.pathname)) return new Response("404 INVALID")
        const handler = routes.get(url.pathname)!

        return handler(req)
    }
}
