const express = require("express");
const db = require("./config/db");
const bodyParser = require("body-parser");
const csrf = require("csurf");
const CONFIG = require("./config/config");
const session = require("express-session");
const { body, validationResult } = require("express-validator");
var FileStore = require("session-file-store")(session);
const { preventback, protect, preventbackprotect } = require("./middleware");

const { PORT, HOST } = CONFIG;

const app = express();

//view engine
app.set("view engine", "ejs");

//use session
var fileStoreOptions = {
  path: "./sessions",
};

app.use(
  session({
    secret: CONFIG.SECRET_KEY,
    store: new FileStore(fileStoreOptions),
    resave: false,
    saveUninitialized: false,
  })
);

//middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(csrf());
app.use(preventback);

//routes
app.get("/", (req, res) => {
  res.redirect("/login");
});

//register route

app.get("/register", preventbackprotect, (req, res) => {
  res.render("register", { csrfToken: req.csrfToken() });
});

app.post(
  "/register",
  [
    body(["name", "email", "password"])
      .notEmpty()
      .withMessage("All field are required"),
    body("name")
      .matches(/^[a-zA-Z]+$/)
      .withMessage("Name must contain only letters"),
    body("email").isEmail().withMessage("Invalid email format"),
    body("password")
      .isLength({ min: 6, max: 10 })
      .withMessage("Password must be at least 6, max 10 char.")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).+$/)
      .withMessage("Password must include upper, lower, number & special char"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("register", {
        error: errors.array()[0].msg,
        csrfToken: req.csrfToken(),
      });
    }

    const { name, email, password } = req.body;

    //if user already exists
    const checkuser = "SELECT * FROM user WHERE email = ?";
    db.query(checkuser, [email], (err, result) => {
      if (result.length > 0 || err) {
        return res.render("register", {
          error: "Email already registered",
          csrfToken: req.csrfToken(),
        });
      }

      const sql = "INSERT INTO user (name, email, password) VALUES (?, ?, ?)";
      db.query(sql, [name, email, password], (err, result) => {
        if (err) {
          return res.render("register", {
            error: "Error registering user. Please try again.",
            csrfToken: req.csrfToken(),
          });
        }
        res.redirect("/login");
      });
    });
  }
);

//login route

app.get("/login", preventbackprotect, (req, res) => {
  const { authenticated } = req.session;

  if (authenticated) {
    return res.redirect("/dashboard");
  } else {
    res.render("login", { csrfToken: req.csrfToken() });
  }
});

app.post(
  "/login",
  [
    body(["email", "password"])
      .notEmpty()
      .withMessage("All field are required"),
    body("email").isEmail().withMessage("Invalid email format"),
    body("password").notEmpty().withMessage("Password is required."),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("login", {
        error: errors.array()[0].msg,
        csrfToken: req.csrfToken(),
      });
    }

    const { email, password } = req.body;
    const sql = "SELECT * FROM user WHERE email=? AND BINARY password=?";

    db.query(sql, [email, password], (err, result) => {
      if (err || result.length === 0) {
        return res.render("login", {
          error: "Invalid email or password.",
          csrfToken: req.csrfToken(),
        });
      }

      req.session.authenticated = true;
      req.session.name = result[0].name;
      req.session.email = result[0].email;

      req.session.save((err) => {
        if (err) {
          return res.render("login", {
            error: "Session error. Try again.",
            csrfToken: req.csrfToken(),
          });
        }
        res.redirect("/dashboard");
      });
    });
  }
);

//logout route

app.get("/logout", protect, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("Error logging out");
    } else {
      res.redirect("/login");
    }
  });
});

//dashboard route

app.get("/dashboard", protect, (req, res) => {
  res.render("dashboard", {
    name: req.session.name,
    email: req.session.email,
    csrfToken: req.csrfToken(),
  });
});

//server start
app.listen(PORT, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
});
