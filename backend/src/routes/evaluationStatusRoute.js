import express from "express";
import { auth } from "../middleware/auth.js";
import { getEvaluationStatusAll,getEvaluationStatusID,createEvaluationStatus,updateEvaluationStatus,updateEvaluationStatusStatus,deleteEvaluationStatus } from "../controllers/evaluationStatusController.js";

const router = express.Router();

router.get("/", auth, getEvaluationStatusAll);
router.get("/:id", auth, getEvaluationStatusID);
router.post("/", auth, createEvaluationStatus);
router.put("/status/:id", auth, updateEvaluationStatusStatus);
router.put("/:id", auth, updateEvaluationStatus);
router.delete("/:id", auth, deleteEvaluationStatus);

export default router;