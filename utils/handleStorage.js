const multer = require("multer")
const path = require("path");
const fs = require("fs")

const storage = multer.diskStorage({

    destination:function(req, file, callback){ //Pasan argumentos automáticamente
        const pathStorage = __dirname+"/../storage"
        callback(null, pathStorage) //error y destination
    },

    filename:function(req, file, callback){ //Sobreescribimos o renombramos

        //Tienen extensión jpg, pdf, mp4
        const filename = "image-"+ file.originalname
        callback(null, filename)

    }
})

const memory = multer.memoryStorage()

const uploadMiddleware = multer({storage}) //Middleware entre la ruta y el controlador
const uploadMiddlewareMemory = multer({storage: memory})

const deleteImages = async (imageArray) => {
    try {
        for (let i= 0; i < imageArray.length; i++ ){

            // Ruta completa de la imagen en el almacenamiento
            let filename= "image-"+imageArray[i].split('/').pop()
            let filePath = path.join(__dirname, "../storage/", filename);

            // Verificamos si el imagen existe antes de eliminarlo
            if (fs.existsSync(filePath)) {
                // Eliminamos el imagen utilizando fs.unlink
                fs.unlink(filePath, (err) => {
                    if (err) {
                        throw new Error("Error al intentar eliminar la imagen: " + err.message);
                    }
                });

            } 
        }
    } 
    catch (error) {
        console.error("Error al borrar la imagen del almacenamiento interno:", error.message);
    }
};

module.exports = {uploadMiddleware, uploadMiddlewareMemory, deleteImages}