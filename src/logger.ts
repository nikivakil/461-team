import winston from 'winston';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const logLevel = process.env.LOG_LEVEL || 'info';
const logFile = process.env.LOG_FILE || 'logs/package-evaluator.log';

// Ensure the logs directory exists
import fs from 'fs';
const dir = path.dirname(logFile);
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

// Create logger
const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'package-evaluator' },
  transports: [
    // Write to all logs with level `info` and below to `package-evaluator.log`
    new winston.transports.File({ filename: logFile }),
    // Write all logs error (and below) to `error.log`
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
  ],
});
export default logger;
