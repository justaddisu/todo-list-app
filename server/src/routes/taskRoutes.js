import { Router } from "express";
import {
  createTask,
  deleteTask,
  getTaskById,
  getTasks,
  getUpcomingReminders,
  shareTask,
  unshareTask,
  updateTask,
  getTags,
  getTasksByTag,
} from "../controllers/taskController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.use(protect);

router.route("/").get(getTasks).post(createTask);
router.route("/tags/all").get(getTags); // Get all tags for user
router.route("/tags/filter").get(getTasksByTag); // Get tasks by tag
router.route("/reminders/upcoming").get(getUpcomingReminders);
router.route("/:id/share").post(shareTask);
router.route("/:id/share/:userId").delete(unshareTask);
router.route("/:id").get(getTaskById).put(updateTask).delete(deleteTask);

export default router;
