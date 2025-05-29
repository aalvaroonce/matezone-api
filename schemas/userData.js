module.exports = {
    type: 'object',
    properties: {
        token: {
            type: 'string',
            example:
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NjYxZDYzMWIzNDU2ZDc2NWUzOWFmNzgiLCJyb2xlIjoidXNlciIsImlhdCI6MTcxNzY4Nzg1OCwiZXhwIjoxNzIwMjc5ODU4fQ.XL5wbLRp9_2EFT_nJK-tU2eBF4Kp6hZaLq1yochsHT1'
        },
        user: {
            type: 'object',
            example: {
                email: 'a.car@immune.com',
                status: 0,
                role: 'user',
                _id: '6661d631b3456d765e39af78'
            }
        }
    }
};
