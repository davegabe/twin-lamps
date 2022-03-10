import createError from "http-errors";
import express, { ErrorRequestHandler } from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import { engine } from "express-handlebars";
import bulbRouter from "./routes/bulb";
import loginRouter from "./routes/login";
import indexRouter from "./routes/index";
const app = express();

// view engine setup
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "../views"));
app.engine("handlebars", engine());

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "../public")));


app.use("/bulb", bulbRouter);
app.use("/login", loginRouter);
app.use("/", indexRouter);


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
