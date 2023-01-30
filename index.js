const express = require("express");
require("dotenv").config();
const session = require("express-session");
const cfg = require("./config");
const rateLimit = require("express-rate-limit");
const winston = require("winston");
const expressWinston = require("express-winston");
const responseRate = require("response-time");
const cors = require("cors");
const helmet = require("helmet");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();
const port = process.env.PORT;

const store = new session.MemoryStore();
const protect = (req, res, next) => {
    const { authenticated } = req.session;
    if (!authenticated) {
        res.sendStatus(401);
    } else {
        next();
    }
};

app.use(
    session({
        secret: cfg.secret_key,
        resave: false,
        saveUninitialized: true,
        store,
    })
)

// app.use(
//     "/search",
//     createProxyMiddleware({
//         target: "https://medium.com/",
//         changeOrigin: true,
//         pathRewrite: {
//             [`^/search`]: "",
//         },
//     }),
//     cors(),
//     helmet(),
//     session({
//         secret: cfg.secret_key,
//         resave: false,
//         saveUninitialized: true,
//         store,
//     }),
//     rateLimit({
//         windowMs: 15 * 60 * 10000,
//         max: 10,
//     }),
//     responseRate(),
//     expressWinston.logger({
//         transports: [new winston.transports.Console()],
//         format: winston.format.json(),
//         statusLevels: true,
//         meta: false,
//         msg: "HTTP {{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms",
//         expressFormat: true,
//         ignoreRoute() {
//             return false;
//         },
//     })
// );

app.get("/protected", protect, (req, res) => {
    const { name = "user" } = req.query;
    res.send("Hii my name is "+name);
});

app.get("/login", (req, res) => {
    const { authenticated } = req.session;
    if (!authenticated) {
        req.session.authenticated = true;
        res.send("Successfully authenticated");
    } else {
        res.send("Already Authenticated");
    }
});

app.get("/logout", protect, (req, res) => {
    req.session.destroy(() => {
        res.send("Successfully logged out");
    });
});

app.listen(port, () => {
    console.log("listening on port " + port);
});
