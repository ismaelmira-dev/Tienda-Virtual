const express = require('express');
const app = express();
app.use(express.json());


app.use('/api',  require('./routes/productos'));
app.use('/api',   require('./routes/usuarios'));
app.use('/api', require('./routes/categorias'));
app.use('/api',    require('./routes/pedidos'));


const server = app.listen(3000, () =>
  console.log(`API corriendo en http://localhost:${server.address().port}`)
);
