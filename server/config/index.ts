import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

const envPath = (() => {
  if (process.env.DOTENV_CONFIG_PATH) {
    return process.env.DOTENV_CONFIG_PATH;
  }

  const defaultEnv = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(defaultEnv)) {
    return defaultEnv;
  }

  return path.resolve(process.cwd(), '.env.example');
})();

dotenv.config({ path: envPath });

const getRequiredEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

export const config = {
  port: Number(process.env.PORT) || 3001,
  jwtSecret: getRequiredEnv('JWT_SECRET'),
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
  socketIO: {
    pingTimeout: 60000,
    pingInterval: 25000,
  },
};
