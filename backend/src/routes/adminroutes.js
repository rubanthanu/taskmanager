import { Router } from "express";
import { authenticate } from "../middleware/authmiddleware.js";
import { authorize } from "../middleware/rolemiddleware.js";
import { listUsers } from "../controllers/admincontroller.js";

const router = Router();

router.use(authenticate);
router.use(authorize("ADMIN"));

router.get("/users", listUsers);

export default router;
