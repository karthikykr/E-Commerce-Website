const jwt = require("jsonwebtoken");
const User = require("../models/User"); 
/**
 * Auth middleware
 * @param {Array<string>} allowedRoles (Optional) - Pass roles allowed to access this route
 * Example:
 *    doAuthenticate() -> Any authenticated user
 *    doAuthenticate(["admin"]) -> Only admins
 *    doAuthenticate(["user", "admin"]) -> Both users & admins
 */
const doAuthenticate = (allowedRoles = []) => {
  return async (req, res, next) => {
    try {
      const token =
        req.header("Authorization")?.replace("Bearer ", "") ||
        req.header("x-auth-token") ||
        req.cookies?.token;

      if (!token) {
        return res.status(401).json({
          success: false,
          message: "Access denied. No token provided.",
        });
      }

      // Verify JWT
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Fetch user
      const user = await User.findById(decoded.id);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid token. User not found.",
        });
      }

      // Role check (only if allowedRoles array is provided)
      if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Allowed roles: ${allowedRoles.join(", ")}`,
        });
      }

      // Attach user to request for controller access
      req.user = {
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
};

      next();
    } catch (error) {
      console.error("Auth middleware error:", error);

      if (error.name === "JsonWebTokenError") {
        return res.status(401).json({ success: false, message: "Invalid token." });
      }

      if (error.name === "TokenExpiredError") {
        return res.status(401).json({ success: false, message: "Token expired." });
      }

      res.status(500).json({ success: false, message: "Server error in authentication." });
    }
  };
};

module.exports = doAuthenticate;

//use like this frontend

// const res = await fetch("http://localhost:3001/api/categories", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//       body: JSON.stringify({
//         name: "Electronics",
//         description: "Category for electronic products",
//       }),
//     });