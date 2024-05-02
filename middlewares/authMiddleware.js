const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    // Correctly checking for the OPTIONS method
    if (req.method === "OPTIONS") {
        return next();
    }

    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
        return next({ status: 400, message: "Вы не авторизованы" });
    }
    try {
        const decodedData = jwt.verify(token, "123");
        req.user = decodedData; 
        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return next({ status: 401, message: "Срок действия токена истек" });
        } else if (error.name === "JsonWebTokenError") {
            return next({ status: 401, message: "Недействительный токен" });
        } else {
            return next({ status: 500, message: "Ошибка при проверке токена" });
        }
    }
};
