'use strict';

const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
};

// Define log colors
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white'
};

winston.addColors(colors);

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../logs');
if ((process.env.NODE_ENV === 'production' || process.env.LOG_TO_FILE === 'true') && !fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Define log format
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}${info.stack ? '\n' + info.stack : ''}`
  )
);

// Create transports
const transports = [
  // Console transport
  new winston.transports.Console({
    format: process.env.NODE_ENV === 'production' ? format : consoleFormat,
    level: process.env.LOG_LEVEL || 'info'
  }),

  // File transports (only in production or if LOG_TO_FILE is enabled)
  ...(process.env.NODE_ENV === 'production' || process.env.LOG_TO_FILE === 'true' ? [
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/error.log'),
      level: 'error',
      format: format
    }),
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/combined.log'),
      format: format
    })
  ] : [])
];

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  levels,
  format,
  transports,
  exceptionHandlers: [
    new winston.transports.Console({ format: consoleFormat }),
    ...(process.env.NODE_ENV === 'production' || process.env.LOG_TO_FILE === 'true' ? [
      new winston.transports.File({ filename: path.join(__dirname, '../logs/exceptions.log') })
    ] : [])
  ],
  rejectionHandlers: [
    new winston.transports.Console({ format: consoleFormat }),
    ...(process.env.NODE_ENV === 'production' || process.env.LOG_TO_FILE === 'true' ? [
      new winston.transports.File({ filename: path.join(__dirname, '../logs/rejections.log') })
    ] : [])
  ]
});

module.exports = logger;

