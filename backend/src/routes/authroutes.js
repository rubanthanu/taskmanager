import { Router } from "express";
import { register, login,logout } from "../controllers/authcontroller.js";
import { authenticate } from "../middleware/authmiddleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticate, (req, res) => {
  res.json({
    user: req.user,
  });
});
router.post("/logout", logout);
export default router;
