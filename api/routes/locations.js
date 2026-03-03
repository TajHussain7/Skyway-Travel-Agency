import express from "express";
import { getLocations } from "../controllers/locationController.js";

const router = express.Router();

// Public route - anyone can fetch active locations for search
router.get("/", getLocations);

export default router;
