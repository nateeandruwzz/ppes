import jwt from "jsonwebtoken";

export const createToken = (data) => jwt.sign(data, process.env.JWT_SECRET, { expiresIn: "7d" });