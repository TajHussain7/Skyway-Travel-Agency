import express from "express";
const router = express.Router();
import { submitContactQuery } from "../controllers/userController.js";

router.post("/", submitContactQuery);

export default router;
