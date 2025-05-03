const { userModel, proFormaModel } = require( '../models' );
const { verifyToken } = require( '../utils/handleToken' );
const { handleHttpError } = require( '../utils/handleError' );

const proforma = require('../services/proforma');

const authMiddleware = async ( req, res, next ) => // TODO: Sustituir handleHttpError por badResponse cuando se estandarice el formato
{
	try
	{
		const token = req.headers.authorization?.split( ' ' ).pop() || req.query.token;

		if ( !token ) return handleHttpError( res, 'NOT_TOKEN', 401 );

		// Del token, miramos en Payload (revisar verifyToken de utils/handleToken)
		const dataToken = verifyToken( token );
	
		if ( !dataToken || !dataToken._id )
			return handleHttpError( res, 'ERROR_ID_TOKEN', 401 );

		
		const user = await userModel.findById( dataToken._id );
		if (!user) {
			const proforma = await proFormaModel.findById ( dataToken._id );
			req.proforma = proforma;
		} else {
			req.user = user;
		}

	  
		if ( !req.body.code && !proforma && user?.status === 0 )
			return handleHttpError( res, 'USER_NOT_VALIDATED', 401 );

		next();
	}

	catch ( err )
	{
		console.log(err)
		return handleHttpError( res, 'NOT_SESSION', 401 );
	}
};

module.exports = authMiddleware;
