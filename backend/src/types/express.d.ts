import "express-serve-static-core";

declare global {
  namespace Express {
    interface Request {
      /** Filled by mini-app JWT auth middleware */
      userId?: string;
    }
  }
}

export {};
