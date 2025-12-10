import {
    isRouteErrorResponse,
    Links,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";
import { AuthProvider } from "./context/AuthContext";

export const links: Route.LinksFunction = () => [
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
    },
    {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&family=Outfit:wght@100..900&display=swap",
    },
];

export function Layout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <Meta />
                <Links />
            </head>
            <body>
                {children}
                <ScrollRestoration />
                <Scripts />
            </body>
        </html>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <Outlet />
        </AuthProvider>
    );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
    let message = "Oops!";
    let details = "An unexpected error occurred.";
    let stack: string | undefined;

    if (isRouteErrorResponse(error)) {
        message = error.status === 404 ? "404" : "Error";
        details =
            error.status === 404
                ? "The requested page could not be found."
                : error.statusText || details;
    } else if (import.meta.env.DEV && error && error instanceof Error) {
        details = error.message;
        stack = error.stack;
    }

    return (
        <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-surface-900">
            <div className="text-center">
                <h1 className="text-6xl font-bold text-primary-500 mb-4">{message}</h1>
                <p className="text-xl text-surface-300 mb-8">{details}</p>
                {stack && (
                    <pre className="max-w-2xl mx-auto p-4 bg-surface-800 rounded-lg overflow-x-auto text-left text-sm text-surface-400">
                        <code>{stack}</code>
                    </pre>
                )}
                <a
                    href="/"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-500 text-surface-900 font-medium rounded-full mt-8 hover:bg-primary-400 transition-colors"
                >
                    Go back home
                </a>
            </div>
        </main>
    );
}
