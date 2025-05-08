require("dotenv").config();

const uploadToPinata = async (fileBuffer, fileName, id) => {
    const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
    let data = new FormData();
    const bufferBlob= new Blob([fileBuffer])
    data.append('file', bufferBlob, fileName);

    const PINATA_KEY= process.env.PINATA_KEY
    const PINATA_SECRET= process.env.PINATA_SECRET


    const metadata = JSON.stringify({
        name: fileName,
        id: id
    });
    data.append('pinataMetadata', metadata);

    const options = JSON.stringify({
        cidVersion: 0,
    });
    data.append('pinataOptions', options);
    try {
        const response = await fetch(url, {
            method: 'POST',
            body: data,
            headers: {
                'pinata_api_key': PINATA_KEY,
                'pinata_secret_api_key': PINATA_SECRET
            }
        });
        if (!response.ok) {
            throw new Error(`Error al subir el archivo: ${response.statusText}`);
        }
        const responseData = await response.json();
        return responseData;
    } catch (error) {
        console.error('Error al subir el archivo a Pinata:', error);
        throw error;
    }
 };

 // Función para eliminar una imagen de Pinata
 const deleteFromPinata = async (cid) => {
    const url = `https://api.pinata.cloud/pinning/unpin/${cid}`;
    const PINATA_KEY = process.env.PINATA_KEY;
    const PINATA_SECRET = process.env.PINATA_SECRET;

    try {
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'pinata_api_key': PINATA_KEY,
                'pinata_secret_api_key': PINATA_SECRET,
            },
        });

        if (!response.ok) {
            throw new Error(`Error al eliminar el archivo con CID ${cid}: ${response.statusText}`);
        }
        console.log(`Archivo con CID ${cid} eliminado de Pinata.`);
    } catch (error) {
        console.error(`Error al eliminar el archivo con CID ${cid}:`, error.message);
        throw error;
    }
};

module.exports = {uploadToPinata, deleteFromPinata}