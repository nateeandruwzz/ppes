import jwt from "jsonwebtoken";

export const auth = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ status: 0,message: "ไม่ได้เข้าสู่ระบบ" });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (e) {
        return res.status(403).json({ status: 0, message: "โทเค็นไม่ถูกต้อง" });
    }
};

export const personnel = (req, res, next) => {
  if (req.user.role !== "Personnel")
    return res.status(403).json({ message: "Personnel เท่านั้น" });
    next();
};

export const evaluator = (req, res, next) => {
  if (req.user.role !== "Evaluator")
    return res.status(403).json({ message: "Evaluator เท่านั้น" });
    next();
};