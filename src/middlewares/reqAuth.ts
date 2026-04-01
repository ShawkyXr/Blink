import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';

interface AuthenticatedRequest extends Request {
    userId?: string;
}

const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.userId = (decoded as any).id;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

export default requireAuth;