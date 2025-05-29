// Importamos express
require('dotenv').config();
const express = require('express');
const dbConnect = require('./config/mongo.js');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./docs/swagger.js');
const apiLimiter = require('./middleware/rate-limiter');
const cors = require('cors');

const app = express();
app.set('trust proxy', 1);
app.use(cors());

// Middleware para JSON
app.use(express.json());

// Definimos el swagger en la /api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Montar las rutas
app.use('/api/', apiLimiter);
app.use('/api', require('./routes'));

// Seleccionamos el puerto
const port = process.env.PORT || 8000;

// Hacemos que el servidor escuche las solicitudes
const server = app.listen(port, () => {
    console.log(`Servidor escuchando en el puerto ${port}`);

    dbConnect();
});

module.exports = { app, server };
