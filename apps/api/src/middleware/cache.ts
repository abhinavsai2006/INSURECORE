import apicache from 'apicache';

export const cache = apicache.middleware;

export const userCache = (duration: string) => 
  apicache.options({
    appendKey: (req: any, res: any) => req.user?.id || 'guest',
    statusCodes: {
      include: [200, 201],
    }
  }).middleware(duration);

export const clearCache = (target: string) => {
  apicache.clear(target);
};
