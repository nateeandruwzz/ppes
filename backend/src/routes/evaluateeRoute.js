import express from "express";
import { auth } from "../middleware/auth.js";
import { getEvaluateeAll,getEvaluateeID,createEvaluatee,updateEvaluatee,deleteEvaluatee } from "../controllers/evaluateeController.js";

const router = express.Router();

router.get("/", auth, getEvaluateeAll);
router.get("/:id", auth, getEvaluateeID);
router.post("/", auth, createEvaluatee);
router.put("/:id", auth, updateEvaluatee);
router.delete("/:id", auth, deleteEvaluatee);

export default router;