import express from "express";
import { auth } from "../middleware/auth.js";
import { saveSummary, getSummary, getAllSummaries } from "../controllers/committeeSummaryController.js";

const router = express.Router();

router.get("/", auth, getAllSummaries);
router.post("/", auth, saveSummary);
router.get("/:periodId/:evaluateeId", auth, getSummary);

export default router;
