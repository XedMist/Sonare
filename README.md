# Sonare

Sonare is a modern, full-stack music streaming application designed with a modern aesthetic. It provides a comprehensive set of features for discovering, organizing, and playing music, backed by a robust and scalable architecture.

## 🚀 Features

-   **Music Playback**: Seamless playback of tracks, albums, and playlists.
-   **Unified Search**: Powerful search across tracks, albums, and artists.
-   **User Library**: personalized user profiles, playlists, and "Liked Songs" (Favorites).
-   **Lyrics Support**: Integrated synced lyrics for tracks.
-   **Role-Based Access Control (RBAC)**: secure permission management for users and roles.
-   **Modern UI/UX**: distinctive modern design language, featuring smooth animations and 3D elements.

## 🛠 Tech Stack

### Backend
-   **Runtime**: [Bun](https://bun.sh/)
-   **Framework**: [Hono](https://hono.dev/) - Fast, lightweight, web-standard.
-   **Database**: [MongoDB](https://www.mongodb.com/) (via [Prisma ORM](https://www.prisma.io/)).
-   **Caching**: [Redis](https://redis.io/).
-   **Storage**: [MinIO](https://min.io/) (S3-compatible object storage).
-   **API Documentation**: Swagger UI & Scalar.

### Frontend
-   **Framework**: [React Router v7](https://reactrouter.com/) (formerly Remix).
-   **Language**: TypeScript.
-   **Styling**: [Tailwind CSS v4](https://tailwindcss.com/).
-   **UI Components**: [Shadcn/UI](https://ui.shadcn.com/) (Radix UI).
-   **Visuals**: [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) & [Anime.js](https://animejs.com/) for animations.

## 📦 Prerequisites

Before running the project, ensure you have the following installed:
-   [Bun](https://bun.sh/) (latest version)
-   MongoDB instance
-   Redis instance
-   MinIO instance (or AWS S3 credentials)

## 🔧 Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd Sonare
    ```

2.  **Install dependencies:**
    *   **Root (Backend):**
        ```bash
        bun install
        ```
    *   **Frontend:**
        ```bash
        cd frontend
        bun install
        ```

3.  **Environment Configuration:**
    *   Create a `.env` file in the root directory based on `.env.example`.
    *   Configure your database URLs, Redis connection, and S3/MinIO credentials.

4.  **Database Setup:**
    ```bash
    # Generate Prisma Client
    bun run generate

    # Push schema to MongoDB
    bun run push
    ```

5.  **Running the Application:**

    *   **Backend (API):**
        From the root directory:
        ```bash
        bun run dev
        ```
        The API will typically start on port `3000` (check console output).

    *   **Frontend:**
        From the `frontend` directory:
        ```bash
        cd frontend
        bun run dev
        ```
        The frontend client will start on `http://localhost:5173`.

## 📂 Project Structure

### Backend (`src/`)

The backend follows a layered architecture (Controller -> Service -> Repository).

-   `controller/`: **API Entry Points**. Handles HTTP requests, validation, and responses.
    -   `auth.ts`, `me.ts`, `search.ts`, `playlist.ts`, etc.
-   `services/`: **Business Logic**. Contains the core logic for the application.
    -   `SearchService.ts`: Engines the unified search functionality.
    -   `AuthService.ts`: Handles registration, login, and token management.
    -   `PlaylistService.ts`, `TrackService.ts`, etc.
-   `repositories/`: **Data Access**. Direct interaction with the database via Prisma.
    -   `UserRepository.ts`, `PlaylistRepository.ts`, etc.
-   `middleware/`:
    -   `auth.ts`: JWT authentication middleware.
    -   `openapi.ts`: API documentation configuration.
-   `model/`: Zod schemas and TypeScript types.

### Frontend (`frontend/app/`)

Built with React Router v7, using a file-system based routing approach.

-   `routes/`: **Pages & Views**.
    -   `app.home.tsx`: Main landing page.
    -   `app.search.tsx`: Unified search interface.
    -   `app.library.tsx`, `app.favorites.tsx`: User library management.
    -   `app.playlists.$id.tsx`: Playlist detail view.
-   `components/`: **UI Components**. Reusable Shadcn/UI components and custom widgets.
-   `api/`: **API Client**. TypeScript functions for communicating with the backend API.
-   `context/`: **State Management**. React Context providers (e.g., for the global music player state).
-   `lib/`: **Utilities**. Helper functions and shared logic.

### Database & Config

-   `prisma/`:
    -   `schema.prisma`: The single source of truth for the database schema.

