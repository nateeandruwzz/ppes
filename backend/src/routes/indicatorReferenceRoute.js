import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { auth } from "../middleware/auth.js";
import { getReferencesByIndicator, createReference, createMultipleReferences, deleteReference } from "../controllers/indicatorReferenceController.js";

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
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, uniqueSuffix + ext);
    },
});

// Filter เฉพาะไฟล์ที่อนุญาต
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
    limits: { fileSize: 100 * 1024 * 1024 }, // Max 100MB
    fileFilter: fileFilter,
});

// Routes
router.get("/indicator/:id", auth, getReferencesByIndicator);

// Single file upload
router.post("/", auth, upload.single("file"), createReference);

// Multiple files upload
router.post("/multiple", auth, upload.array("files", 20), createMultipleReferences);

router.delete("/:id", auth, deleteReference);

// Error Handler for Multer
router.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({ status: 0, message: "ไฟล์มีขนาดใหญ่เกินไป (สูงสุด 100MB)" });
        }
        return res.status(400).json({ status: 0, message: err.message });
    } else if (err) {
        return res.status(400).json({ status: 0, message: err.message });
    }
    next();
});

export default router;
