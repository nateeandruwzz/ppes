import bcrypt from "bcryptjs";
import User from "../models/userModel.js";
import { createToken } from "../utils/token.js";

export const getUserAll = async (req, res) => {
  try {
    const rows = await User.getAll();
    if(rows.length > 0){
        return res.json({status: 1, message: "สำเร็จ", data: rows});
    }else{
        return res.json({status: 0, message: "ไม่พบข้อมูล"});
    }
  } catch (err) {
    return res.status(500).json({status: 0, message: "เซิร์ฟเวอร์ผิดพลาด" });
  }
};
export const getUserEmail = async (req, res) => {
  try {
    const { email } = req.params;
    const rows = await User.getByEmail(email);
    if (!rows) {
      return res.status(404).json({ status: 0, message: "ไม่พบอีเมล์" });
    }
    return res.json({ status: 1, data: rows });
  } catch (err) {
    return res.status(500).json({ status: 0, message: "เซิร์ฟเวอร์ผิดพลาด" });
  }
};

export const getUserID = async (req, res) => {
    try {
        const rows = await User.getByID(req.params.id);
        if(!rows){
            res.json({status: 0, message: "ไม่พบผู้ใช้"});
        }else {
            res.json({status: 1, message: "สำเร็จ", data: rows});
        }
    }catch (err){
        return res.status(500).json({ status: 0, message: "เซิร์ฟเวอร์ผิดพลาด" });
    }
};

export const getUserRole = async (req, res) => {
    try{
        const rows = await User.getByRole(req.params.role);
        if(!rows.length){
            res.json({status: 0, message: `ไม่พบบทบาท ${req.params.role}`});
        }else {
            res.json({status: 1, message: "สำเร็จ", data: rows});
        }
    }catch (err){
        return res.status(500).json({ status: 0, message: "เซิร์ฟเวอร์ผิดพลาด" });
    }
};

export const createUser = async (req, res) => {
    try {
        const { prefix, first_name, last_name, password, email, phone, role } = req.body;
        if (!password || !email) {
            return res.status(400).json({ status: 0, message: "ต้องใส่รหัสผ่าน/อีเมล์" });
        }
        if (!email.includes("@")) {
            return res.status(400).json({ status: 0, message: "อีเมล์ไม่ถูกต้อง" });
        }
        // ตรวจสอบ email ซ้ำ
        const rows = await User.getByEmail(email);
        if (rows) return res.status(400).json({ status: 0,message: "อีเมล์ซ้ำ" });

        if (!["Personnel", "Evaluatees","Evaluator"].includes(role)) {
            return res.status(400).json({ status: 0, message: "บทบาทไม่ถูกต้อง" });
        }
        const hash = await bcrypt.hash(password, 10);
        const result = await User.create(prefix, first_name, last_name, hash, email, phone, role);
        if(result.insertId > 0){
            return res.status(201).json({status: 1, message: "ลงทะเบียนสำเร็จ", data: { id: result.insertId }});
        }else{
            return res.status(400).json({status: 0, message: "ลงทะเบียนไม่สำเร็จ"});
        }
    } catch (err) {
        return res.status(500).json({ status: 0, message: "เซิร์ฟเวอร์", data: erผิดพลาดr });
    }
};

export const updateUser = async (req, res) => {
  try {
    const { prefix, first_name, last_name, email, phone } = req.body;
    if (!email.includes("@")) {
        return res.status(400).json({ status: 0, message: "อีเมล์ไม่ถูกต้อง" });
    }
    //ป้องกัน user ที่ไม่ใช่ admin แก้ไขข้อมูลผู้อื่น
    if (req.user.role !== "Personnel" && req.user.id != req.params.id) {
        return res.status(403).json({ status: 0, message: "ไม่มีสิทธิแก้ไข" });
    }
    const result = await User.update(
      req.params.id,
      prefix,
      first_name,
      last_name,
      email,
      phone
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ status: 0, message: "ไม่พบผู้ใช้" });
    }

    res.json({ status: 1, message: "สำเร็จ" });
  } catch (err) {
    res.status(500).json({ status: 0, message: "เซิร์ฟเวอร์ผิดพลาด" });
  }
};

export const updateUserPassword = async (req, res) => {
    try{
        const {password} = req.body;
        if (!password) {
            return res.status(400).json({ status: 0, message: "ต้องใส่รหัสผ่าน" });
        }
        //ป้องกัน user ที่ไม่ใช่ admin แก้ไขข้อมูลผู้อื่น
        if (req.user.role !== "Personnel" && req.user.id != req.params.id) {
            return res.status(403).json({ status: 0, message: "ไม่มีสิทธิแก้ไข" });
        }
        //encode password
        const hash = await bcrypt.hash(password, 10);

        const result = await User.updatePassword(req.params.id,hash);
        if (result.affectedRows === 0) {
            return res.status(404).json({ status: 0, message: "ไม่พบผู้ใช้" });
        }
        res.json({status: 1, message: "สำเร็จ", data: result});
    } catch (err) {
        return res.status(500).json({ status: 0, message: "เซิร์ฟเวอร์ผิดพลาด" });
    }
};
export const updateUserRole = async (req, res) => {
    try{
        const {role} = req.body;
        if (!["Personnel", "Evaluatee","Evaluator"].includes(role)) {
            return res.status(400).json({ status: 0, message: "บทบาทไม่ถูกต้อง" });
        }
        //ป้องกัน user ที่ไม่ใช่ admin แก้ไขข้อมูลผู้อื่น
        if (req.user.role !== "Personnel" && req.user.id != req.params.id) {
            return res.status(403).json({ status: 0, message: "ไม่มีสิทธิแก้ไข" });
        }
        const result = await User.updateRole(req.params.id,role);
        if (result.affectedRows === 0) {
            return res.status(404).json({ status: 0, message: "ไม่พบผู้ใช้" });
        }
        res.json({status: 1, message: "สำเร็จ", data: result});
    } catch (err) {
        return res.status(500).json({ status: 0, message: "เซิร์ฟเวอร์ผิดพลาด" });
    }
};
export const updateUserEmail = async (req, res) => {
    try{
        const {email} = req.body;
        if (!email.includes("@")) {
            return res.status(400).json({ status: 0, message: "อีเมล์ไม่ถูกต้อง" });
        }
        //ป้องกัน user ที่ไม่ใช่ admin แก้ไขข้อมูลผู้อื่น
        if (req.user.role !== "Personnel" && req.user.id != req.params.id) {
            return res.status(403).json({ status: 0, message: "ไม่มีสิทธิแก้ไข" });
        }
        const result = await User.updateEmail(req.params.id,email);
        if (result.affectedRows === 0) {
            return res.status(404).json({ status: 0, message: "ไม่พบผู้ใช้" });
        }
        res.json({status: 1, message: "สำเร็จ", data: result});
    } catch (err) {
        return res.status(500).json({ status: 0, message: "เซิร์ฟเวอร์ผิดพลาด" });
    }
};

export const deleteUser = async (req, res) => {
    try{
        //ป้องกัน user ที่ไม่ใช่ admin แก้ไขข้อมูลผู้อื่น
        if (req.user.role !== "Personnel" && req.user.id != req.params.id) {
            return res.status(403).json({ status: 0, message: "ไม่มีสิทธิแก้ไข" });
        }
        const result = await User.delete(req.params.id);
        if (result.affectedRows === 0) {
            return res.status(404).json({ status: 0, message: "ไม่พบผู้ใช้" });
        }
        res.json({status: 1, message: "สำเร็จ", data: result});
    } catch (err) {
        return res.status(500).json({ status: 0, message: "เซิร์ฟเวอร์ผิดพลาด" });
    }
};

export const login = async (req, res) => {
    try{
        const { email, password } = req.body;
        const user = await User.getByEmail(email);
        if (!user) {
            return res.status(404).json({ status: 0, message: "ไม่พบผู้ใช้" });
        }
        const ok = bcrypt.compareSync(password, user.password);
        if (!ok) {
            return res.status(401).json({ status: 0, message: "รหัสผ่านไม่ถูกต้อง" });
        }
        const token = createToken({
            id: user.id,
            role: user.role,
            email: user.email,
        });

        // User data
        const userData = {
            id: user.id,
            role: user.role,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
        }

        res.json({ status: 1, message: "เข้าสู่ระบบสำเร็จ", token, data: userData });
    } catch (err) {
        return res.status(500).json({ status: 0, message: "เซิร์ฟเวอร์ผิดพลาด" });
    }
};