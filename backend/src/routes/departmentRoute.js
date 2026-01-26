import express from "express";
import { auth } from "../middleware/auth.js";
import { getDepartmentAll,getDepartmentID,createDepartment,updateDepartment,deleteDepartment } from "../controllers/departmentController.js";

const router = express.Router();

router.get("/", getDepartmentAll);
router.get("/:id", auth, getDepartmentID);
router.post("/", auth, createDepartment);
router.put("/:id", auth, updateDepartment);
router.delete("/:id", auth, deleteDepartment);

export default router;