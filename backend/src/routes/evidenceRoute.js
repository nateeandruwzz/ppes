import express from "express";
import { auth } from "../middleware/auth.js";
import { getEvidenceAll,getEvidenceID,createEvidence,updateEvidence,deleteEvidence } from "../controllers/evidenceController.js";

const router = express.Router();

router.get("/", auth, getEvidenceAll);
router.get("/:id", auth, getEvidenceID);
router.post("/", auth, createEvidence);
router.put("/:id", auth, updateEvidence);
router.delete("/:id", auth, deleteEvidence);

export default router;