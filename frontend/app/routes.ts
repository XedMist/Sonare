import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
    // Landing
    index("routes/home.tsx"),

    // Auth (public)
    route("login", "routes/login.tsx"),
    route("register", "routes/register.tsx"),

    // App (private) 
    route("app", "routes/app.tsx", [
        // App home (index)
        index("routes/app.home.tsx"),

        // Nav 
        route("search", "routes/app.search.tsx"),
        route("library", "routes/app.library.tsx"),

        // Detail routes
        route("artists/:id", "routes/app.artists.$id.tsx"),
        route("albums/:id", "routes/app.albums.$id.tsx"),
        route("playlists/:id", "routes/app.playlists.$id.tsx"),
    ]),
] satisfies RouteConfig;
