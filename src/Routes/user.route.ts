import { Router } from "express";
import { register , login , getProfile } from "../controllers/user.controller.js";
import requireAuth from "../middlewares/reqAuth.js";

const router = Router();

router.route ('/register')
    .post(register);

router.route ('/login')
    .post(login);

router.route ('/profile')
    .get(requireAuth, getProfile);

export default router;