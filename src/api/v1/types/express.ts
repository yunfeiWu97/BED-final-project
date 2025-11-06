import { Request, Response, NextFunction } from "express";

/**
 * Standard Express middleware function type used in demo.
 */
export type MiddlewareFunction = (
  req: Request,
  res: Response,
  next: NextFunction
) => void;
