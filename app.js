const express = require("express");
const db = require("./src/config/db");
const CONFIG = require("./src/config/config");
const session = require("express-session");
var FileStore = require("session-file-store")(session);
const authroutes = require("./src/routes/authroutes");
const dashboardroutes = require("./src/routes/dashboardroutes");
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

app.use(authroutes);
app.use(dashboardroutes);

//server start
app.listen(PORT, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
});
