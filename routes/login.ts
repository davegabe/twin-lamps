import express from "express";
import sha256 from "crypto-js/sha256";
const router = express.Router();

/** Token corresponding to user and password (easy auth) */
const authToken = sha256(process.env.USER + process.env.PASSWORD).toString();

// GET login
router.get("/", (req, res) => {
    if (req.cookies.token === authToken) {
        res.redirect("/");
    } else {
        res.render("login", { websiteName: process.env.WEBSITENAME, title: "444 - Login" });
    }
});

// POST login 
router.post("/", (req, res) => {
    const { username, password } = req.body as { username: string; password: string; };
    if (username === process.env.USER && password === process.env.PASSWORD) {
        res.cookie("token", authToken, {
            secure: req.app.get("env") === "development" ? false : true,
            httpOnly: req.app.get("env") === "development" ? false : true
        });
        res.redirect("/");
    } else {
        res.redirect("/login");
    }
});

export default router;