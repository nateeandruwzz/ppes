import express from "express";
import { auth } from "../middleware/auth.js";
import { getEvaluationScaleAll,getEvaluationScaleID,createEvaluationScale,updateEvaluationScale,updateEvaluationScaleValue,deleteEvaluationScale } from "../controllers/evaluationScaleController.js";

const router = express.Router();

router.get("/", auth, getEvaluationScaleAll);
router.get("/:id", auth, getEvaluationScaleID);
router.post("/", auth, createEvaluationScale);
router.put("/value/:id", auth, updateEvaluationScaleValue);
router.put("/:id", auth, updateEvaluationScale);
router.delete("/:id", auth, deleteEvaluationScale);

export default router;