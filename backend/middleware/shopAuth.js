import jwt from "jsonwebtoken";
import Shop from "../model/shopModel.js";

const shopAuth = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization || "";
    const token = authorization.startsWith("Bearer ")
      ? authorization.slice(7)
      : req.cookies?.token;

    if (!token) return res.status(401).json({ message: "Shop login required" });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.role !== "shop" || !payload.shopId) {
      return res.status(403).json({ message: "Shop token required" });
    }

    const shop = await Shop.findById(payload.shopId).select("status");
    if (!shop || shop.status !== "Approved") {
      return res.status(403).json({ message: "Shop is not approved" });
    }

    req.shopId = payload.shopId.toString();
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired shop token" });
  }
};

export default shopAuth;
