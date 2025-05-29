const checkRol = roles => (req, res, next) => {
    try {
        const { user } = req;
        const userRol = user.role;
        const checkValueRol = roles.includes(userRol);

        if (checkValueRol) {
            return next();
        }

        return res.status(403).send({ message: 'No tiene derecho a hacer esta acción' });
    } catch (err) {
        console.log(err);
        res.status(500).send({ message: 'Error al comprobar el rol' });
    }
};
module.exports = { checkRol };
