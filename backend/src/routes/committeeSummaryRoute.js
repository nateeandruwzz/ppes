import express from "express";
import { auth } from "../middleware/auth.js";
import { getCommitteeSummaryAll,getCommitteeSummaryID,createCommitteeSummary,updateCommitteeSummary, deleteCommitteeSummary } from "../controllers/committeeSummaryController.js";

const router = express.Router();

router.get("/", auth, getCommitteeSummaryAll);
router.get("/:id", auth, getCommitteeSummaryID);
router.post("/", auth, createCommitteeSummary);
router.put("/:id", auth, updateCommitteeSummary);
router.delete("/:id", auth, deleteCommitteeSummary);

export default router;