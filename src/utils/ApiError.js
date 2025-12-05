class ApiError extends Error {
    constructor(statusCode, message = 'something is wrong', errors = []) {
        super(message)
        this.status = statusCode
        this.errors = errors
        this.success = false
    }
}

export default ApiError