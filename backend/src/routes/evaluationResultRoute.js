import express from "express";
import { auth } from "../middleware/auth.js";
import {
    getEvaluationResultAll,
    getEvaluationResultID,
    createEvaluationResult,
    updateEvaluationResult,
    deleteEvaluationResult,
    summarizeEvaluation,
    getTrackingData,
    getReportData,
    getEvaluateeSummary
} from "../controllers/evaluationResultController.js";

const router = express.Router();

router.get("/", auth, getEvaluationResultAll);
router.post("/summarize", auth, summarizeEvaluation);

// NEW: API สำหรับดึงข้อมูลที่คำนวณจาก Backend
router.get("/tracking/:period_id", auth, getTrackingData);
router.get("/report/:period_id", auth, getReportData);
router.get("/summary/:period_id/:evaluatee_id", auth, getEvaluateeSummary);

router.get("/:id", auth, getEvaluationResultID);
router.post("/", auth, createEvaluationResult);
router.put("/:id", auth, updateEvaluationResult);
router.delete("/:id", auth, deleteEvaluationResult);

export default router;