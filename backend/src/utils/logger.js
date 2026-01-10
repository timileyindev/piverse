const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
};

const formatMessage = (level, context, message, data = {}) => {
  const timestamp = new Date().toISOString();
  const dataStr = Object.keys(data).length > 0 ? ` | ${JSON.stringify(data)}` : '';
  return `[${timestamp}] [${level}] [${context}] ${message}${dataStr}`;
};

const logger = {
  error: (context, message, data = {}) => {
    console.error(formatMessage(LOG_LEVELS.ERROR, context, message, data));
  },
  
  warn: (context, message, data = {}) => {
    console.warn(formatMessage(LOG_LEVELS.WARN, context, message, data));
  },
  
  info: (context, message, data = {}) => {
    console.log(formatMessage(LOG_LEVELS.INFO, context, message, data));
  },
  
  debug: (context, message, data = {}) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(formatMessage(LOG_LEVELS.DEBUG, context, message, data));
    }
  },

  request: (req, status, duration) => {
    const data = {
      method: req.method,
      path: req.path,
      status,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent')?.slice(0, 50)
    };
    console.log(formatMessage(LOG_LEVELS.INFO, 'HTTP', `${req.method} ${req.path}`, data));
  }
};

module.exports = logger;
