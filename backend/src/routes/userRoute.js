import express from "express";
import { auth, personnel, evaluator } from "../middleware/auth.js";
import { 
    getUserAll, 
    getUserEmail, 
    getUserID, 
    getUserRole, 
    createUser, 
    login,
    updateUser,
    updateUserPassword,
    updateUserRole,
    updateUserEmail,
    deleteUser
} from "../controllers/userController.js";

const router = express.Router();

router.get("/", auth, getUserAll);
router.get("/email/:email", auth, getUserEmail);
router.get("/role/:role", auth, getUserRole);
router.get("/:id", auth, getUserID);
router.post("/register",createUser);
router.post("/login",login);
router.put("/password/:id", auth, updateUserPassword);
router.put("/email/:id", auth, updateUserEmail);
router.put("/role/:id", auth, updateUserRole);
router.put("/:id", auth, updateUser);
router.delete("/:id", auth, deleteUser);

export default router;