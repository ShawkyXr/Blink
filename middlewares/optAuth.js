import jwt from 'jsonwebtoken';

const optionalAuth = (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.userId = decoded.id;
        }
        next();
  } catch (error) {
        next();
  }
}

export default optionalAuth;