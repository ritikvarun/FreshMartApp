import jwt from "jsonwebtoken";

const invoiceAuth = (req, res, next) => {
  try {
    const authorization = req.headers.authorization || "";
    const token = authorization.startsWith("Bearer ")
      ? authorization.slice(7)
      : req.cookies?.token;

    if (!token) return res.status(401).json({ message: "Login required" });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const configuredAdminEmail = (process.env.ADMIN_EMAIL || "")
      .trim()
      .toLowerCase();
    const tokenEmail = (payload.email || "").trim().toLowerCase();

    if (configuredAdminEmail && tokenEmail === configuredAdminEmail) {
      req.isAdmin = true;
    } else if (payload.userId) {
      req.userId = payload.userId.toString();
    } else {
      return res.status(403).json({ message: "Invoice access denied" });
    }

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export default invoiceAuth;
