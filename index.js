require('dotenv').config();
const express = require('express');
const app = express();
app.use(express.json());

// Middleware de autenticación
app.use((req, res, next) => {
  const apiKey = req.headers['password'];

  if (!apiKey) {
    return res.status(401).json({
      success: false,
      message: 'API key requerida'
    });
  }

  if (apiKey !== process.env.API_PASSWORD) {
    return res.status(403).json({
      success: false,
      message: ' la Password incorrecta'
    });
  }

  next();
});

// Rutas
app.use('/api', require('./routes/productos'));
app.use('/api', require('./routes/usuarios'));
app.use('/api', require('./routes/categorias'));
app.use('/api', require('./routes/pedidos'));

// Render asigna el puerto automáticamente via process.env.PORT
const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`API corriendo en http://localhost:${server.address().port}`);
}); 