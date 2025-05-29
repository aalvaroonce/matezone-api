// middleware/rate-limiter.js
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutos
  max: 1000, // limite de 1000 solicitudes por IP en cada ventana de tiempo
  message: 'Too many requests from this IP, please try again later',
  // Definir cómo identificar a los clientes
  standardHeaders: true, // Devolver los headers 'RateLimit-*' estándar
  legacyHeaders: false, // Deshabilitar los headers 'X-RateLimit-*'
  skip: (req, res) => {
    // Verificar si la solicitud proviene de la web-admin
    const header = req.header('X-Platform');
    return header === 'web'; 
  }
});

module.exports = apiLimiter;