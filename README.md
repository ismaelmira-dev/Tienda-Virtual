# API REST – Tienda Virtual

## Equipo
- Ismael Mira
- Mariana Suárez
- Mariana Uribe

## URL de la API en producción
```
https://tienda-virtual-wqvg.onrender.com
```

## Autenticación

Todos los endpoints requieren el siguiente header:

| Header | Valor |
|--------|-------|
| `password` | `MiPasswordSegura2024` |
| `x-user-role` | `admin` _(solo en POST, PUT, DELETE)_ |

---

## Endpoints

### 📦 Productos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/productos` | Lista todos los productos (soporta filtros por query) |
| GET | `/api/productos/:id` | Obtiene un producto por su ID |
| POST | `/api/productos` | Crea un nuevo producto |
| PUT | `/api/productos/:id` | Actualiza un producto existente |
| DELETE | `/api/productos/:id` | Elimina un producto |

### 👤 Usuarios

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/usuarios` | Lista todos los usuarios (soporta filtros por query) |
| GET | `/api/usuarios/:id` | Obtiene un usuario por su ID |
| POST | `/api/usuarios` | Crea un nuevo usuario |
| PUT | `/api/usuarios/:id` | Actualiza un usuario existente |
| DELETE | `/api/usuarios/:id` | Elimina un usuario |

### 🗂️ Categorías

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/categorias` | Lista todas las categorías |
| GET | `/api/categorias/:id` | Obtiene una categoría por su ID |
| POST | `/api/categorias` | Crea una nueva categoría |
| PUT | `/api/categorias/:id` | Actualiza una categoría existente |
| DELETE | `/api/categorias/:id` | Elimina una categoría |

### 🛒 Pedidos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/pedidos` | Lista todos los pedidos |
| GET | `/api/pedidos/:id` | Obtiene un pedido por su ID |
| POST | `/api/pedidos` | Crea un nuevo pedido |
| PUT | `/api/pedidos/:id` | Actualiza un pedido existente |
| DELETE | `/api/pedidos/:id` | Elimina un pedido |

---

## Ejemplos de uso

### GET – Listar usuarios
```bash
curl https://tienda-virtual-wqvg.onrender.com/api/usuarios \
  -H "password: MiPasswordSegura2024"
```

### POST – Crear usuario
```bash
curl -X POST https://tienda-virtual-wqvg.onrender.com/api/usuarios \
  -H "password: MiPasswordSegura2024" \
  -H "x-user-role: admin" \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Juan","email":"juan@example.com","rol":"cliente","activo":true}'
```

### GET – Filtrar productos por nombre
```bash
curl "https://tienda-virtual-wqvg.onrender.com/api/productos?nombre=camisa" \
  -H "password: MiPasswordSegura2024"
```

### DELETE – Eliminar un pedido
```bash
curl -X DELETE https://tienda-virtual-wqvg.onrender.com/api/pedidos/1 \
  -H "password: MiPasswordSegura2024" \
  -H "x-user-role: admin"
```