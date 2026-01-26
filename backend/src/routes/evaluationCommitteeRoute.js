import express from "express";
import { auth } from "../middleware/auth.js";
import { getEvaluationCommitteeAll, getEvaluationCommitteeID, createEvaluationCommittee, updateEvaluationCommittee, deleteEvaluationCommittee } from "../controllers/evaluationCommitteeController.js";

const router = express.Router();

router.get("/", auth, getEvaluationCommitteeAll);
router.get("/:id", auth, getEvaluationCommitteeID);
router.post("/", auth, createEvaluationCommittee);
router.put("/:id", auth, updateEvaluationCommittee);
router.delete("/:id", auth, deleteEvaluationCommittee);

export default router;