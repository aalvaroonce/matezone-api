const { validationResult, matchedData } = require( 'express-validator' );

function validateResults( req, res, next )
{
	try
	{
		validationResult( req ).throw();
		req.MATCHED = req.MATCHED ? { ...req.MATCHED, ...matchedData( req ) } : matchedData( req );
		return next();
	}
	catch ( err )
	{
		return res.status( 422 ).send( err );
	}
}

module.exports = validateResults;