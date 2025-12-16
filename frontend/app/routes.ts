import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),

    route("login", "routes/login.tsx"),
    route("register", "routes/register.tsx"),

    route("app", "routes/app.tsx", [
        index("routes/app.home.tsx"),

        route("search", "routes/app.search.tsx"),
        route("library", "routes/app.library.tsx"),
        route("profile", "routes/app.profile.tsx"),

        route("artists/:id", "routes/app.artists.$id.tsx"),
        route("albums/:id", "routes/app.albums.$id.tsx"),
        route("playlists/:id", "routes/app.playlists.$id.tsx"),
    ]),

    route("*", "routes/not-found.tsx"),
] satisfies RouteConfig;
