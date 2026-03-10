import jwt from "jsonwebtoken";


export const protect = (req, res, next) => {
  const auth = req.headers.authorization;

  if (!auth) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = auth.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Token format invalid" });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = decoded;
    next();

  } catch (error) {
    console.log("JWT Error:", error.message);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: "Token expired" });
    }
    return res.status(401).json({ error: "Invalid token" });
  }
};
