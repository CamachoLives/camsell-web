# Camsell Web

Frontend del marketplace **Camsell** para compra y venta de vehículos. Los
filtros de búsqueda, los campos del formulario de publicación y las fichas
técnicas **no están escritos a mano**: se generan en tiempo de ejecución desde
el catálogo de parámetros del backend.

Backend que consume: [camsell-api](https://github.com/CamachoLives/camsell-api).

---

## La idea central

El backend expone un esquema de *grupos de parámetros*. Cada grupo declara su
código, su tipo de dato (`OPTION`, `TEXT`, `NUMBER`, `BOOLEAN`), su ámbito y
unas banderas: si es filtrable, si es obligatorio para publicar, si va en la
ficha técnica y si admite varios valores.

Este frontend lee ese esquema y lo interpreta:

| Pieza | Qué hace con el esquema |
|---|---|
| [`FilterPanel`](src/features/listings/FilterPanel.tsx) | Dibuja un filtro por cada grupo `filterable`: chips para opciones, select cuando el catálogo es largo, casilla para booleanos, campo numérico para números. |
| [`DynamicField`](src/features/parameters/DynamicField.tsx) | Dibuja el campo equivalente en el formulario de publicación y valida la obligatoriedad con la misma regla del backend. |
| [`SpecsTable`](src/features/listings/SpecsTable.tsx) | Arma la ficha técnica respetando el orden y las etiquetas que definió el administrador. |
| [`useParameterDictionary`](src/features/parameters/hooks.ts) | Traduce los códigos estables del backend a texto legible en toda la interfaz. |

**Consecuencia práctica:** un administrador crea el grupo *Nivel de blindaje*
desde la consola y, sin desplegar nada, aparece como filtro en el catálogo,
como campo en el formulario de publicación y como fila en la ficha técnica.

---

## Stack

| | |
|---|---|
| React | 19 |
| Build | Vite 8 |
| Lenguaje | TypeScript 6 en modo estricto |
| Estilos | Tailwind CSS 4 (plugin de Vite) |
| Rutas | React Router 7 (data router) |
| Estado del servidor | TanStack Query 5 |
| Estado de sesión y tema | Zustand 5 |
| HTTP | axios con interceptores |
| Formularios | react-hook-form |
| Iconos | lucide-react |

---

## Cómo correrlo

Necesitas el backend corriendo en `http://localhost:8080`
(`mvn spring-boot:run` en [camsell-api](https://github.com/CamachoLives/camsell-api)).

```bash
npm install
npm run dev
```

Abre <http://localhost:5173>.

El servidor de desarrollo redirige `/api` hacia el backend, así que el cliente
llama siempre a rutas relativas y no hace falta configurar CORS en local.

```bash
npm run build      # typecheck + build de producción
npm run preview    # sirve el build
npm run lint       # oxlint
```

### Variables de entorno

Copia `.env.example` a `.env` si necesitas cambiar algo:

| Variable | Default | Para qué |
|---|---|---|
| `VITE_API_BASE_URL` | vacío | URL base del backend. Vacío usa el proxy de desarrollo. En producción apunta al dominio del API. |
| `VITE_API_PROXY` | `http://localhost:8080` | Destino del proxy, si el backend no corre en el 8080. |

---

## Cuentas de demostración

Clave para todas: `Camsell2026*`. La pantalla de ingreso las ofrece con un
clic, así que no hace falta copiarlas a mano.

| Correo | Rol | Qué puedes ver |
|---|---|---|
| `admin@camsell.dev` | `ADMIN` | Consola de parámetros, marcas y redacción de noticias |
| `ventas@autonorte.co` | `DEALER` | Publicaciones destacadas de un concesionario |
| `laura.gomez@mail.com` | `USER` | Publicaciones propias y ofertas recibidas |
| `carlos.ruiz@mail.com` | `USER` | Ofertas enviadas y favoritos |

---

## Rutas

| Ruta | Pantalla | Acceso |
|---|---|---|
| `/` | Portada: destacados, marcas, noticias e indicadores | público |
| `/vehiculos` | Catálogo con filtros parametrizables | público |
| `/vehiculos/:slug` | Ficha del vehículo, galería y oferta | público |
| `/noticias` | Feed editorial con categorías y etiquetas | público |
| `/noticias/:slug` | Lectura de la nota y relacionadas | público |
| `/ingresar` · `/registro` | Sesión | público |
| `/publicar` | Publicación en tres pasos | autenticado |
| `/cuenta` | Publicaciones, ofertas, favoritos y perfil | autenticado |
| `/admin` | Parámetros, marcas y noticias | `ADMIN` |

---

## Organización

Arquitectura por funcionalidad (*feature-sliced*): cada carpeta de `features/`
es autónoma y expone su API, sus hooks y sus componentes. `shared/` contiene lo
transversal y no conoce ninguna funcionalidad.

```
src/
├── app                 App.tsx: router y providers
├── pages/              Una pantalla por ruta, compone funcionalidades
├── features/
│   ├── auth/           Sesión JWT, rutas protegidas, menú de usuario
│   ├── parameters/     Esquema configurable, diccionario, campos dinámicos
│   ├── listings/       Catálogo, filtros, ficha, galería, especificaciones
│   ├── offers/         Flujo de compra
│   ├── favorites/      Vehículos guardados
│   ├── news/           Sección informativa
│   └── admin/          Consola de configuración
└── shared/
    ├── api/            Cliente axios, tipos del contrato, caché, sesión
    ├── ui/             Sistema de componentes
    ├── layout/         Shell, header, footer, tema
    ├── lib/            Formato, clases, tema
    └── hooks/          Utilidades de React
```

### Decisiones que vale la pena conocer

- **Los filtros viven en la URL.** Una búsqueda se puede compartir, guardar en
  marcadores y recuperar con el botón atrás. `useListingFilters` es el único
  lugar que traduce entre la URL y los criterios de la API.
- **Errores tipados.** El cliente convierte el `ProblemDetail` (RFC 9457) del
  backend en una clase `ApiError` con `status`, `code` y errores por campo. La
  interfaz reacciona al código estable y no al texto del mensaje, y los errores
  de validación se muestran junto al input correspondiente.
- **Sesión con expiración local.** El token se guarda con su fecha de
  vencimiento, así que una sesión caduca se descarta al arrancar sin esperar un
  401; además se revalida el perfil contra el servidor por si cambió el rol.
- **No se reintenta lo que va a fallar igual.** React Query no reintenta
  respuestas 4xx.
- **Carga sin saltos.** Al paginar se conservan los resultados anteriores
  atenuados en lugar de colapsar a un esqueleto.
- **Accesibilidad como parte del producto.** Enlace de salto al contenido, foco
  movido al cambiar de ruta, foco siempre visible, etiquetas en todos los
  campos, `aria-pressed` en los chips de filtro, `aria-live` en los resultados
  y respeto de `prefers-reduced-motion`.
- **Tema sin destello.** El tema se aplica en un script inline antes de pintar
  y se persiste en `localStorage` con lectura tolerante a fallos.
- **El contenido editorial no se inyecta como HTML.** El cuerpo de las notas se
  renderiza como párrafos de texto, no con `innerHTML`.

---

## Licencia

MIT
