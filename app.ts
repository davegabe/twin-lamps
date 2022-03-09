import createError from "http-errors";
import express, { ErrorRequestHandler } from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import { engine } from "express-handlebars";
import MqttHandler from "./mqtt_handler";
const app = express();

/** List of ids of bulbs from env */
const lampsIds = process.env.LAMPS.split(",");
/** List of types of bulbs from env */
const lampsType = process.env.LAMPSTYPE.split(",");
/** List of MQTT clients for every bulb */
const mqttClients = [] as MqttHandler[];
for (let i = 0; i < lampsIds.length; i++) {
  mqttClients.push(new MqttHandler(lampsType[i], lampsIds[i]));
  mqttClients[i].connect();
}

// view engine setup
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "../views"));
app.engine("handlebars", engine());

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "../public")));

// login page
app.get("/", (req, res) => {
  res.render("login", { websiteName: process.env.WEBSITENAME, title: "444 - Login" });
});

// home page
app.post("/", (req, res) => {
  const { username, password } = req.body as { username: string; password: string; };
  if (username === process.env.USER && password === process.env.PASSWORD) {
    res.render("index", { websiteName: process.env.WEBSITENAME, title: "444 - Home" });
  } else {
    res.redirect("/");
  }
});

// blink lamp button pressed
app.post("/lamp", (req, res) => {
  const { brightness } = req.body as { brightness: string; };
  for (let i = 0; i < mqttClients.length; i++) {
    mqttClients[i].blink(parseInt(brightness));
  }
  res.send("Message sent");
});

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
};
app.use(errorHandler);

export default app;
