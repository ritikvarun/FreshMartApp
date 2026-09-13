import jwt from 'jsonwebtoken'

const isAuth = async (req, res, next) => {
    try {
        let token = req.cookies?.token

        if (!token && req.headers.authorization) {
            if (req.headers.authorization.startsWith("Bearer ")) {
                token = req.headers.authorization.split(" ")[1]
            } else {
                token = req.headers.authorization
            }
        }

        if (!token && req.headers.token) {
            token = req.headers.token
        }

        if (!token && req.body?.token) {
            token = req.body.token
        }

        if (!token && req.query?.token) {
            token = req.query.token
        }

        // Clean invalid token string values like "undefined" or "null"
        if (token === "undefined" || token === "null" || (typeof token === 'string' && token.trim() === "")) {
            token = null
        }

        console.log("isAuth middleware - token:", token ? "exists" : "missing")

        if (!token) {
            return res.status(401).json({ message: "User does not have token" })
        }

        let verifyToken = jwt.verify(token, process.env.JWT_SECRET)

        if (!verifyToken) {
            return res.status(401).json({ message: "User does not have a valid token" })
        }

        req.userId = verifyToken.userId
        console.log("isAuth - userId set to:", req.userId)
        next()

    } catch (error) {
        console.log("isAuth error:", error.message)
        return res.status(401).json({ message: `isAuth error: ${error.message}` })
    }
}

export default isAuth