import {Request, Response, NextFunction } from "express";
import pino from "pino";
export const logger = pino({
  level: 'info',
});

export default  (error: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(error);

  return res.status(500).send({
    success: false,
    message: error.message
  });
};