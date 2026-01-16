export const logger = {
  info: (message: string, ...args: any[]) => {
    console.log(`ℹ️  ${message}`, ...args);
  },
  success: (message: string, ...args: any[]) => {
    console.log(`✅ ${message}`, ...args);
  },
  error: (message: string, ...args: any[]) => {
    console.error(`❌ ${message}`, ...args);
  },
  warn: (message: string, ...args: any[]) => {
    console.warn(`⚠️  ${message}`, ...args);
  },
  socket: (message: string, ...args: any[]) => {
    console.log(`🔌 ${message}`, ...args);
  },
  chat: (message: string, ...args: any[]) => {
    console.log(`💬 ${message}`, ...args);
  },
};
