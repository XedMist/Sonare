# Sonare - Lista de Tareas Pendientes

## Autenticación y Autorización
- [ ] Implementar autenticación de usuarios (ej. JWT).
- [ ] Proteger las rutas que lo necesiten (ej. crear/modificar playlists).
- [ ] Añadir roles de usuario (ej. admin, usuario normal).

## Funcionalidades Principales
- [ ] **Usuarios:**
    - [ ] Endpoint para que un usuario vea sus playlists.
    - [ ] Endpoint para que un usuario vea sus artistas/canciones favoritas.
- [ ] **Playlists:**
    - [ ] Endpoint para añadir/quitar canciones de una playlist.
    - [ ] Endpoint para hacer una playlist pública o privada.
    - [ ] Endpoint para seguir/dejar de seguir una playlist de otro usuario.
- [ ] **Búsqueda:**
    - [ ] Implementar un endpoint de búsqueda global (artistas, álbumes, canciones).
- [ ] **Artistas y Álbumes:**
    - [ ] Endpoints para ver los álbumes de un artista.
    - [ ] Endpoints para ver las canciones de un álbum.
- [ ] **Lyrics:**
## Base de Datos
- [ ] Revisar y optimizar las consultas a la base de datos.
- [ ] Añadir más relaciones si es necesario (ej. tabla de "favoritos" para usuarios y canciones).
- [ ] Implementar paginación en los endpoints que devuelven listas largas (ej. canciones de un artista).
- [ ] Cambiar a prisma.

## Pruebas (Testing)
- [ ] Escribir tests unitarios para los servicios.
- [ ] Escribir tests de integración para los controllers.
- [ ] Configurar un pipeline de CI/CD para correr los tests automáticamente.

## Documentación
- [ ] Completar la documentación de la API en Swagger para todos los endpoints.
- [ ] Añadir ejemplos de petición y respuesta en la documentación.
- [ ] Docs para el profe
## Mejoras y Refactorización
- [ ] Mejorar el manejo de errores y los mensajes de respuesta.
- [ ] Validar los datos de entrada en todos los endpoints.
- [ ] Refactorizar código duplicado si lo hay.
- [ ] Paginación en listas largas.
- [ ] Logs
