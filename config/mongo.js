const mongoose = require('mongoose')

const dbConnect = () => {
    const db_uri = process.env.DB_URI
    mongoose.set('strictQuery', false)

    try {
        mongoose.connect(db_uri)
    } catch (error) {
        console.err("No se ha podido establecer la conexión a la BD:", error)
    }
    //listen events
    mongoose.connection.on('connected', () => console.log('Conectado a la BD'));
}
module.exports = dbConnect
