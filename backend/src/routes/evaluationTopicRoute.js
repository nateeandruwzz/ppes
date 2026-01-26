import express from "express";
import { auth } from "../middleware/auth.js";
import { getEvaluationTopicAll,getEvaluationTopicID,createEvaluationTopic,updateEvaluationTopic,deleteEvaluationTopic } from "../controllers/evaluationTopicController.js";

const router = express.Router();

router.get("/", auth, getEvaluationTopicAll);
router.get("/:id", auth, getEvaluationTopicID);
router.post("/", auth, createEvaluationTopic);
router.put("/:id", auth, updateEvaluationTopic);
router.delete("/:id", auth, deleteEvaluationTopic);

export default router;