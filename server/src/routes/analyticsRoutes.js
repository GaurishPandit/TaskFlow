import { Router } from "express";
import { getSummary } from "../controllers/analyticsController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.use(protect);
router.get("/summary", getSummary);

export default router;
