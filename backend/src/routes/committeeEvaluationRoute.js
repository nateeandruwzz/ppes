import express from "express";
import { auth } from "../middleware/auth.js";
import { 
    getCommitteeEvaluationAll,
    getCommitteeEvaluationID,
    createCommitteeEvaluation,
    updateCommitteeEvaluationScore,
    updateCommitteeEvaluation,
    deleteCommitteeEvaluation } from "../controllers/committeeEvaluationController.js";

const router = express.Router();

router.get("/", auth, getCommitteeEvaluationAll);
router.get("/:id", auth, getCommitteeEvaluationID);
router.post("/", auth, createCommitteeEvaluation);
router.put("/score/:id", auth, updateCommitteeEvaluationScore);
router.put("/:id", auth, updateCommitteeEvaluation);
router.delete("/:id", auth, deleteCommitteeEvaluation);

export default router;