# Sonare

## Estructura

```
├── deno.json
├── deno.lock
├── README.md
└── src
    ├── app.ts  # Donde se añaden los controladores
    ├── controller 
    │   ├─── user.ts
    │   ├─── artist.ts
    │   ├─── playlist.ts
    │   ├─── track.ts
    │   ├─── users.ts
    ├── main.ts # Entrypoint de la API
    ├── middleware
    │   └── ...
    ├── model
    │   └── ...
    ├── repositories
    │   └── ...
    └── services
        └── ...
```

### Guía de la estructura

- **`deno.json`**: Archivo de configuración para Deno, donde se definen las
  dependencias, tareas y opciones del compilador.
- **`src/app.ts`**: Archivo principal donde se configuran los controladores y
  middlewares de la aplicación.
- **`src/main.ts`**: Punto de entrada de la API, donde se inicia el servidor.
- **`src/controller/`**: Contiene los controladores que definen las rutas y
  manejan las solicitudes HTTP.
- **`src/middleware/`**: Contiene middlewares personalizados, como la
  configuración de Swagger para la documentación de la API.
- **`src/model/`**: Define los modelos de datos y esquemas de validación, como
  `User`, `Track`, `Album`, etc.
- **`src/repositories/`**: Contiene la lógica de acceso a datos, como el
  almacenamiento en memoria para usuarios.
- **`src/services/`**: Implementa la lógica de negocio, como la creación y
  recuperación de usuarios.

### Cómo iniciar el proyecto

1. Asegúrate de tener [Deno](https://deno.land/) instalado.
2. Ejecuta el siguiente comando para iniciar el servidor:

   ```bash
   deno task start
   ```

3. Accede a la documentación Swagger en `http://localhost:8000/api/swagger/ui`.

### Endpoints disponibles

- **`GET /api/users`**: Obtiene todos los usuarios.
- **`POST /api/users`**: Crea un nuevo usuario. El cuerpo de la solicitud debe
  incluir un objeto JSON con el siguiente formato:

  ```json
  {
    "name": "Nombre del usuario"
  }
  ```

### Dependencias principales

- **[Hono](https://hono.dev/)**: Framework web ligero para Deno.
- **[Zod](https://zod.dev/)**: Biblioteca para validación de esquemas.
- **[Swagger UI](https://swagger.io/tools/swagger-ui/)**: Herramienta para la
  documentación interactiva de APIs.
