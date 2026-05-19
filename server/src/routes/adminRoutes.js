import { Router } from "express";
import {
  createAnyTask,
  createUser,
  deleteAnyTask,
  deleteUser,
  getAllTasks,
  getAllUsers,
  getStats,
  updateAnyTask,
  updateUser,
} from "../controllers/adminController.js";
import { isAdmin } from "../middleware/adminMiddleware.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.use(protect, isAdmin);

router.get("/stats", getStats);

router.get("/users", getAllUsers);
router.post("/users", createUser);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

router.get("/tasks", getAllTasks);
router.post("/tasks", createAnyTask);
router.put("/tasks/:id", updateAnyTask);
router.delete("/tasks/:id", deleteAnyTask);

export default router;
