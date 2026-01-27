import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { auth } from "../middleware/auth.js";

const router = express.Router();

// กำหนด folder สำหรับเก็บไฟล์
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // ใช้ timestamp + original name เพื่อหลีกเลี่ยง duplicate
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, uniqueSuffix + ext);
    },
});

// Filter เฉพาะไฟล์ที่อนุญาต (รูปภาพ, PDF, Word, Excel)
const fileFilter = (req, file, cb) => {
    const allowedMimes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("ประเภทไฟล์ไม่อนุญาต (รองรับ: รูปภาพ, PDF, Word, Excel)"), false);
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // Max 10MB
    fileFilter: fileFilter,
});

// --- Upload Single File ---
router.post("/", auth, upload.single("file"), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ status: 0, message: "กรุณาเลือกไฟล์" });
        }

        // ส่ง path กลับไป
        const filePath = `/uploads/${req.file.filename}`;
        return res.status(201).json({
            status: 1,
            message: "อัปโหลดสำเร็จ",
            data: {
                filename: req.file.filename,
                originalName: req.file.originalname,
                path: filePath,
                size: req.file.size,
                mimetype: req.file.mimetype,
            },
        });
    } catch (err) {
        console.error("Upload Error:", err);
        return res.status(500).json({ status: 0, message: "เซิร์ฟเวอร์ผิดพลาด" });
    }
});

// --- Error Handler for Multer ---
router.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({ status: 0, message: "ไฟล์มีขนาดใหญ่เกินไป (สูงสุด 10MB)" });
        }
        return res.status(400).json({ status: 0, message: err.message });
    } else if (err) {
        return res.status(400).json({ status: 0, message: err.message });
    }
    next();
});

export default router;
