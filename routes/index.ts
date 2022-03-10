import express from "express";
import sha256 from "crypto-js/sha256";
const router = express.Router();

/** Token corresponding to user and password (easy auth) */
const authToken = sha256(process.env.USER + process.env.PASSWORD).toString();

// GET home page
router.get("/", (req, res) => {
    if (req.cookies.token !== authToken) {
        res.redirect("/login");
    } else {
        res.render("index", { websiteName: process.env.WEBSITENAME, title: "444 - Home" });
    }
});

export default router;