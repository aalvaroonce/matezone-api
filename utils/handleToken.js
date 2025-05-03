const jwt = require( 'jsonwebtoken' );
const JWT_SECRET = process.env.JWT_SECRET;

const tokenSign = ( user ) =>
{
	try
	{
		const sign = jwt.sign(
			{
				_id : user._id,
				role: user.role
			},
			JWT_SECRET,
			{
				expiresIn: '30d'
			}
		);
		return sign;
	}
	catch ( e )
	{
		console.log( e );
	}
};


const verifyToken = ( tokenJwt ) =>
{
	try
	{
		return jwt.verify( tokenJwt, JWT_SECRET );
	}
	catch ( err )
	{
		console.log( err );
	}
};


module.exports = { tokenSign, verifyToken };