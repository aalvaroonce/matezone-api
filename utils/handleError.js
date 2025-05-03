const handleHttpError = (res, message, code = 500) => {
    res.status(code).send(message)
}

module.exports = { handleHttpError }