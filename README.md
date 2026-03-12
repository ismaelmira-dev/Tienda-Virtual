# 🛒 Tienda Virtual - API REST

API REST construida con **Node.js**, **Express** y **SQLite3** para gestionar una tienda virtual. Incluye gestión de usuarios, categorías, productos y pedidos con autenticación por API key.

# Diagrama Entidad-Relación (ER)
![3 1 Diagrama E-R](https://github.com/user-attachments/assets/248fd8e9-0f28-46c3-b230-2d235bf81126)

---

## 📋 Requisitos

- Node.js v18 o superior
- npm

---

## 🚀 Instalación

```bash
# Clonar el repositorio
git clone <url-del-repositorio>
cd tienda-virtual

# Instalar dependencias
npm install
```

---

## ▶️ Ejecutar el servidor

```bash
node index.js
```

El servidor correrá en `http://localhost:3000`. La base de datos `database.db` se creará automáticamente al iniciar.

> ⚠️ Si cambias la estructura de las tablas, elimina el archivo `database.db` para que se regenere desde cero.

---

## 🔐 Autenticación

Todos los endpoints requieren un header de autenticación.

| Operación | Header requerido | Valor |
|-----------|-----------------|-------|
| GET | `password` | `12345` |
| POST / PUT / DELETE | `password` | `6789` |
| POST / PUT / DELETE | `x-user-role` | `admin` |

---

## 🗄️ Base de datos

El proyecto usa **SQLite3**. Las tablas se crean automáticamente al iniciar el servidor.

```
Categorias      → id, nombre, descripcion, activa
Usuarios        → id, nombre, email, rol, activo
Productos       → id, nombre, precio, stock, categoriaId
Pedidos         → id, usuarioId, total, estado, fecha
DetallePedido   → id, pedidoId, productoId, cantidad, precio
```

---

## 📦 Endpoints

### Categorías `/api/categorias`

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/categorias` | Obtener todas las categorías |
| GET | `/api/categorias/:id` | Obtener una categoría por ID |
| POST | `/api/categorias` | Crear una nueva categoría |
| PUT | `/api/categorias/:id` | Actualizar una categoría |
| DELETE | `/api/categorias/:id` | Eliminar una categoría |

**Filtros disponibles (GET):** `nombre`, `descripcion`, `activa`

**Body (POST / PUT):**
```json
{
  "nombre": "Electrónica",
  "descripcion": "Dispositivos electrónicos",
  "activa": true
}
```

---

### Usuarios `/api/usuarios`

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/usuarios` | Obtener todos los usuarios |
| GET | `/api/usuarios/:id` | Obtener un usuario por ID |
| POST | `/api/usuarios` | Crear un nuevo usuario |
| PUT | `/api/usuarios/:id` | Actualizar un usuario |
| DELETE | `/api/usuarios/:id` | Eliminar un usuario |

**Filtros disponibles (GET):** `nombre`, `email`, `rol`, `activo`

**Body (POST / PUT):**
```json
{
  "nombre": "Mateo",
  "email": "mateo@gmail.com",
  "rol": "Developer",
  "activo": true
}
```

---

### Productos `/api/productos`

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/productos` | Obtener todos los productos |
| GET | `/api/productos/:id` | Obtener un producto por ID |
| POST | `/api/productos` | Crear un nuevo producto |
| PUT | `/api/productos/:id` | Actualizar un producto |
| DELETE | `/api/productos/:id` | Eliminar un producto |

**Filtros disponibles (GET):** `nombre`, `precio`, `stock`, `categoriaId`

**Body (POST / PUT):**
```json
{
  "nombre": "Laptop",
  "precio": 3000,
  "stock": 5,
  "categoriaId": 1
}
```

> 💡 El GET devuelve también el nombre de la categoría en el campo `categoriaNombre`.

---

### Pedidos `/api/pedidos`

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/pedidos` | Obtener todos los pedidos |
| GET | `/api/pedidos/:id` | Obtener un pedido por ID (con detalle) |
| POST | `/api/pedidos` | Crear un nuevo pedido |
| PUT | `/api/pedidos/:id` | Actualizar un pedido |
| DELETE | `/api/pedidos/:id` | Eliminar un pedido y su detalle |

**Filtros disponibles (GET):** `usuarioId`, `estado`, `fecha`

**Body (POST):**
```json
{
  "usuarioId": 1,
  "total": 3050,
  "estado": "pendiente",
  "fecha": "2025-03-10",
  "detalle": [
    { "productoId": 1, "cantidad": 1, "precio": 3000 },
    { "productoId": 2, "cantidad": 1, "precio": 50 }
  ]
}
```

> 💡 El GET por ID devuelve el pedido junto con todos sus productos en el campo `detalle`.

---

## ✅ Validaciones

Todos los endpoints POST y PUT incluyen las siguientes validaciones:

- **Campos obligatorios** — se verifica que los campos requeridos estén presentes.
- **Tipos de dato** — se verifica que números sean números, texto sea texto y booleanos sean `true`/`false`.
- **Unicidad** — `email` en usuarios y `nombre` en categorías no pueden repetirse (responde con `409 Conflict`).
- **Existencia de relaciones** — al crear un producto se verifica que el `categoriaId` exista; al crear un pedido se verifica que el `usuarioId` exista.

---

## 📁 Estructura del proyecto

```
tienda-virtual/
├── index.js          # Entrada principal, configuración de Express
├── db.js             # Conexión y creación de tablas SQLite
├── database.db       # Base de datos (se genera automáticamente)
├── routes/
│   ├── categorias.js
│   ├── usuarios.js
│   ├── productos.js
│   └── pedidos.js
└── README.md
```

---

## 🛠️ Tecnologías

- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [SQLite3](https://www.npmjs.com/package/sqlite3)
