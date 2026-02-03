import { verifyToken } from "../utils/jwt.util.js";

/* =====================================================
   AUTH → attaches tenant scoped user (SAFE)
===================================================== */
export const requireAuth = (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authorization token required",
      });
    }

    const token = header.split(" ")[1];

    const decoded = verifyToken(token);

    /* ONLY TRUST JWT */
    req.user = {
      id: decoded.sub,                // standard JWT subject
      organizationId: decoded.organizationId, // tenant
    };

    next();
  } catch (err) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};
