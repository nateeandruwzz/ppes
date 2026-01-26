import express from "express";
import { auth } from "../middleware/auth.js";
import { getIndicatorAll,getIndicatorID,getIndicatorPeriod,createIndicator,updateIndicator,deleteIndicator } from "../controllers/indicatorController.js";

const router = express.Router();

router.get("/", auth, getIndicatorAll);
router.get("/period/:id", auth, getIndicatorPeriod);
router.get("/:id", auth, getIndicatorID);
router.post("/", auth, createIndicator);
router.put("/:id", auth, updateIndicator);
router.delete("/:id", auth, deleteIndicator);

export default router;