require('dotenv').config({ path: '.env.dev' });
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
var swaggerUi = require('swagger-ui-express');
var swaggerSpec = require('./config/swagger');
var db = require('./config/database');

var indexRouter = require('./routes/index');
var authRouter = require('./routes/auth');
var usersRouter = require('./routes/users');
var seasonsRouter = require('./routes/seasons');
var sellOrdersRouter = require('./routes/sellOrders');
var bidsRouter = require('./routes/bids');

var app = express();

// Test database connection on startup
db.testConnection();

// Middleware
app.use(logger('dev'));
app.use(cors({
  origin: true, // 요청한 origin을 그대로 허용 (모든 도메인 허용 효과)
  credentials: true, // 쿠키 등 인증 정보 허용
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api', indexRouter);
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/seasons', seasonsRouter);
app.use('/api/sell-orders', sellOrdersRouter);
app.use('/api/bids', bidsRouter);

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

module.exports = app;
