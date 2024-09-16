import { Application, json, urlencoded } from "express";
import * as dotenv from 'dotenv';
dotenv.config();
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
import asyncError from "./errors.middlewares";
import indexRoutes from "../routes/index.routes";

export default (app: Application) => {
  app.use(morgan('combined'));
  // CORS middleware
  app.options("*", cors());
  app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "OPTIONS"],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
  app.use(json());
  app.use(helmet());
  app.use(urlencoded());
  app.use(asyncError);
  indexRoutes(app);
};