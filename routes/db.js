const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err.message);
    } else {
        console.log('Conectado a la base de datos');
    }
});

// Tabla Categorias
db.run(`CREATE TABLE IF NOT EXISTS Categorias (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    activa INTEGER NOT NULL DEFAULT 1
)`);

// Tabla Usuarios
db.run(`CREATE TABLE IF NOT EXISTS Usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    rol TEXT NOT NULL,
    activo INTEGER NOT NULL DEFAULT 1
)`);

// Tabla Productos
db.run(`CREATE TABLE IF NOT EXISTS Productos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    precio REAL NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    categoriaId INTEGER NOT NULL,
    FOREIGN KEY (categoriaId) REFERENCES Categorias(id)
)`);

// Tabla Pedidos
db.run(`CREATE TABLE IF NOT EXISTS Pedidos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuarioId INTEGER NOT NULL,
    total REAL NOT NULL,
    estado TEXT NOT NULL,
    fecha TEXT NOT NULL,
    FOREIGN KEY (usuarioId) REFERENCES Usuarios(id)
)`);

// Tabla DetallePedido
db.run(`CREATE TABLE IF NOT EXISTS DetallePedido (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pedidoId INTEGER NOT NULL,
    productoId INTEGER NOT NULL,
    cantidad INTEGER NOT NULL,
    precio REAL NOT NULL,
    FOREIGN KEY (pedidoId) REFERENCES Pedidos(id),
    FOREIGN KEY (productoId) REFERENCES Productos(id)
)`);

module.exports = db;