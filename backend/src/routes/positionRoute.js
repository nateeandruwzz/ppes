import express from "express";
import { auth } from "../middleware/auth.js";
import { getPositionAll,getPositionID,createPosition,updatePosition,deletePosition } from "../controllers/positionController.js";

const router = express.Router();

router.get("/", getPositionAll);
router.get("/:id",auth, getPositionID);
router.post("/", auth, createPosition);
router.put("/:id", auth, updatePosition);
router.delete("/:id", auth, deletePosition);

export default router;