import { Request, Response, NextFunction } from 'express';
import * as jwt from "jsonwebtoken";
import authConfig from '../config/auth';

interface TokenPayLoad {
  iat: number;
  exp: number;
  sub: string;
}

export default function  ensureAuthenticated(
  request: Request,
  response: Response,
  next: NextFunction,
  ): void {
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new Error('JWT is missing');
    }

    const [, token] = authHeader.split(' ');

    try {
      const decoded = jwt.verify(token, '265c94f442d2d396f232d589da655532');

      const { sub } = decoded as TokenPayLoad;

      request.user = {
        id: sub,
      }

      return next();
    } catch (err) {
      throw new Error('Invalid JWT token');
    }
  }
