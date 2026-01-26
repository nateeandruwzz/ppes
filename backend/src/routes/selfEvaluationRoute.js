import express from "express";
import { auth } from "../middleware/auth.js";
import { getSelfEvaluationAll,getSelfEvaluationID,createSelfEvaluation,updateSelfEvaluation,updateSelfEvaluationScore,updateSelfEvaluationComment,deleteSelfEvaluation } from "../controllers/selfEvaluationController.js";

const router = express.Router();

router.get("/", auth, getSelfEvaluationAll);
router.get("/:id", auth, getSelfEvaluationID);
router.post("/", auth, createSelfEvaluation);
router.put("/score/:id", auth, updateSelfEvaluationScore);
router.put("/comment/:id", auth, updateSelfEvaluationComment);
router.put("/:id", auth, updateSelfEvaluation);
router.delete("/:id", auth, deleteSelfEvaluation);

export default router;