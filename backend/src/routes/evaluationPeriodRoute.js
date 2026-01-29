import express from "express";
import { auth } from "../middleware/auth.js";
import { getEvaluationPeriodAll, getEvaluationPeriodID, getEvaluationPeriodByUser, createEvaluationPeriod, updateEvaluationPeriod, deleteEvaluationPeriod } from "../controllers/evaluationPeriodController.js";

const router = express.Router();

router.get("/", auth, getEvaluationPeriodAll);
router.get("/user/:userId", auth, getEvaluationPeriodByUser);
router.get("/:id", auth, getEvaluationPeriodID);
router.post("/", auth, createEvaluationPeriod);
router.put("/:id", auth, updateEvaluationPeriod);
router.delete("/:id", auth, deleteEvaluationPeriod);

export default router;