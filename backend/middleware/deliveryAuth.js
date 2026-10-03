import jwt from "jsonwebtoken";
import DeliveryPartner from "../model/deliveryModel.js";

const deliveryAuth = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization || "";
    const token = authorization.startsWith("Bearer ")
      ? authorization.slice(7)
      : req.cookies?.token;

    if (!token)
      return res.status(401).json({ message: "Delivery login required" });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.role !== "delivery" || !payload.deliveryId) {
      return res.status(403).json({ message: "Delivery token required" });
    }

    const partner = await DeliveryPartner.findById(payload.deliveryId).select(
      "status",
    );
    if (!partner || partner.status !== "Approved") {
      return res
        .status(403)
        .json({ message: "Delivery partner is not approved" });
    }

    req.deliveryId = payload.deliveryId.toString();
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Invalid or expired delivery token" });
  }
};

export default deliveryAuth;
