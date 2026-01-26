import express from "express";
import { auth } from "../middleware/auth.js";
import { getEvaluationResultAll, getEvaluationResultID, createEvaluationResult, updateEvaluationResult, deleteEvaluationResult, summarizeEvaluation } from "../controllers/evaluationResultController.js";

const router = express.Router();

router.get("/", auth, getEvaluationResultAll);
router.post("/summarize", auth, summarizeEvaluation);
router.get("/:id", auth, getEvaluationResultID);
router.post("/", auth, createEvaluationResult);
router.put("/:id", auth, updateEvaluationResult);
router.delete("/:id", auth, deleteEvaluationResult);

export default router;