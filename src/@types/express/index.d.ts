import * as express from "express";
import { IHall } from "../../models/hall.model";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _unused = express; // Trick ESLint into thinking it's used

declare global {
  namespace Express {
    interface Request {
      user?: {
        _id: string;
        role: "user" | "admin" | "hallOwner";
        email: string;
      };
      hall?: IHall;
    }
  }
}
