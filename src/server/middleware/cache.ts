import { Request, Response, NextFunction } from 'express';
import { API_CONFIG } from '../../config/api';

const cache = new Map<string, { data: any; timestamp: number }>();

export const cacheMiddleware = (duration: number = API_CONFIG.CACHE_DURATION) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.originalUrl;
    const cachedResponse = cache.get(key);

    if (cachedResponse && Date.now() - cachedResponse.timestamp < duration) {
      return res.json(cachedResponse.data);
    }

    const originalJson = res.json;
    res.json = function (data) {
      cache.set(key, {
        data,
        timestamp: Date.now(),
      });
      return originalJson.call(this, data);
    };

    next();
  };
};