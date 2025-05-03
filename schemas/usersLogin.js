module.exports = {
    type: "object", 
    required: ["email, password"],
    properties: {
        email: {
            type: "string", 
            example: "alejandro@gmail.com"
        },
        password: {
            type: "string",
            example: "a123456789"
        }
    }
}