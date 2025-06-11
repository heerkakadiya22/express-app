const express = require("express");
const CONFIG = require("./src/config/config");
const session = require("express-session");
var FileStore = require("session-file-store")(session);
const authRoutes = require("./src/routes/authRoutes");
const dashboardRoutes = require("./src/routes/dashboardRoutes");
const { preventback } = require("./src/middlewares/middleware");

const { PORT, HOST } = CONFIG;

const app = express();

//view engine
app.set("view engine", "ejs");
app.set("views", "./src/views");

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
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(preventback);

app.use(express.static("public"));

app.use(authRoutes);
app.use(dashboardRoutes);

//server start
app.listen(PORT, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
});
