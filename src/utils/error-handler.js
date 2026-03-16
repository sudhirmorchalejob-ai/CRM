// middlewares/error-handler.js
const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // Log the error for the developer
 
    res.status(statusCode).json({
        success: false,
        error : err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined, 
    });
};

module.exports = errorHandler;