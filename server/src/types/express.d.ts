declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: string;
        id: string; // alias for userId
      };
    }
  }
}

export {};
