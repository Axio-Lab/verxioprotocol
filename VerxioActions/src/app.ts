import express from "express";
import indexMiddleware from "./middlewares/index.middlewares";

const app = express();
indexMiddleware(app);

export default app;