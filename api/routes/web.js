import express from "express";
const router = express.Router();
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../views/home.html"));
});

router.get("/flights", (req, res) => {
  res.sendFile(path.join(__dirname, "../views/flights.html"));
});

router.get("/about-us", (req, res) => {
  res.sendFile(path.join(__dirname, "../views/about-us.html"));
});

router.get("/contact-us", (req, res) => {
  res.sendFile(path.join(__dirname, "../views/contact-us.html"));
});

router.get("/offers", (req, res) => {
  res.sendFile(path.join(__dirname, "../views/offers.html"));
});

router.get("/umrah", (req, res) => {
  res.sendFile(path.join(__dirname, "../views/umrah.html"));
});

router.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "../views/login.html"));
});

router.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "../views/register.html"));
});

export default router;
