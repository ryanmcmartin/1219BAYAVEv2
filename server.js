const bcrypt = require("bcrypt")
const express = require("express")
const req = require("express/lib/request")
const db = require("better-sqlite3")("app.db")
db.pragma("journal_mode = WAL")

// DB SETUP HERE
const createTables = db.transaction(() => {
    db.prepare(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username STRING NOT NULL UNIQUE,
        password STRING NOT NULL
    )
    `).run()
})
createTables()

// DB SETUP ENDS HERE
const app = express()

app.set("view engine", "ejs")
app.use(express.urlencoded({extended: false}))
app.use(express.static("public"))

//MIDDLEWARE
app.use(function (req, res, next) {
    res.locals.errors = []
    next()
})

app.get("/", (req, res) => {
    res.render("home")
})

app.get("/login", (req, res) => {
    res.render("login")
})

app.post("/register", (req, res) => {
    const errors = []

    if (typeof req.body.username !== "string") req.body.username = ""
    if (typeof req.body.username !== "string") req.body.username = ""

    req.body.username = req.body.username.trim()

    if (!req.body.username) errors.push("You must provide a username.")
    if (req.body.username && req.body.username.length < 3) errors.push("Username must be at least 3 char.")
    if (req.body.username && !req.body.username.match(/^[a-zA-Z0-9]+$/)) errors.push("Username must only include letters and numbers.")

    if (!req.body.password) errors.push("You must provide a password.")
    if (req.body.password && req.body.password.length < 8) errors.push("Password must be at least 8 char.")

    if (errors.length) {
        return res.render("home", {errors})
    }

    // SAVE THE NEW USER INTO A DB
    const salt = bcrypt.genSaltSync(10)
    req.body.password = bcrypt.hashSync(req.body.password, salt)

    const sqlNewUser = db.prepare("INSERT INTO users (username, password) VALUES (?, ?)")
    sqlNewUser.run(req.body.username, req.body.password)

    res.send("Thank You!")


    // LOG THE USER IN BY GIVING THEM A COOKIE

    
})

app.listen(3000)