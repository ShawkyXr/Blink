import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';

interface AuthenticatedRequest extends Request {
    userId?: string;
}

const optionalAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET!);
            req.userId = (decoded as any).id;
        }
        next();
  } catch (error) {
        next();
  }
}

export default optionalAuth;