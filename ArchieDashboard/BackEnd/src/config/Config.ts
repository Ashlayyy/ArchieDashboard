import IConfig from '../types/IConfig';

const config: IConfig = {
  request: {
    rateLimit: {
      window: 15 * 60 * 1000,
      max: 150
    },
    slowDown: {
      window: 15 * 60 * 1000,
      delayAfter: 100,
      delayMs: 100
    }
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info'
  }
};

export default config;
