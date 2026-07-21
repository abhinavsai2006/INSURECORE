"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const config_1 = require("./config");
const errorHandler_1 = require("./middleware/errorHandler");
const rateLimiter_1 = require("./middleware/rateLimiter"); // We'll need to create this
const auth_1 = require("./middleware/auth");
const auth_2 = require("./middleware/auth");
// Import controllers
const authController = __importStar(require("./controllers/auth.controller"));
const userController = __importStar(require("./controllers/user.controller"));
const customerController = __importStar(require("./controllers/customer.controller"));
const policyController = __importStar(require("./controllers/policy.controller"));
const claimController = __importStar(require("./controllers/claim.controller"));
const paymentController = __importStar(require("./controllers/payment.controller"));
const documentController = __importStar(require("./controllers/document.controller"));
const reportController = __importStar(require("./controllers/report.controller"));
const notificationController = __importStar(require("./controllers/notification.controller"));
// Initialize Express app
const app = (0, express_1.default)();
// Middleware setup
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: config_1.config.frontendUrl,
    credentials: true
}));
app.use(express_1.default.json({ limit: '2mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '2mb' }));
app.use((0, cookie_parser_1.default)());
// Request logging (we'll create a simple one for now)
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
    next();
});
// Global rate limiting (100 requests per minute)
app.use(rateLimiter_1.globalRateLimiter);
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
// API routes
const apiRouter = express_1.default.Router();
// Auth routes (public)
apiRouter.post('/auth/register', authController.register);
apiRouter.post('/auth/login', authController.login);
apiRouter.post('/auth/refresh', authController.refresh);
apiRouter.post('/auth/logout', authController.logout);
apiRouter.post('/auth/forgot-password', authController.forgotPassword);
apiRouter.post('/auth/reset-password', authController.resetPassword);
apiRouter.get('/auth/me', auth_1.authenticate, authController.me);
// User routes (admin only)
apiRouter.get('/users', auth_1.authenticate, (0, auth_2.authorize)(['ADMIN']), userController.getAll);
apiRouter.post('/users', auth_1.authenticate, (0, auth_2.authorize)(['ADMIN']), userController.create);
apiRouter.get('/users/:id', auth_1.authenticate, (0, auth_2.authorize)(['ADMIN']), userController.getById);
apiRouter.patch('/users/:id', auth_1.authenticate, (0, auth_2.authorize)(['ADMIN']), userController.update);
apiRouter.delete('/users/:id', auth_1.authenticate, (0, auth_2.authorize)(['ADMIN']), userController.delete);
// Customer routes
apiRouter.get('/customers', auth_1.authenticate, customerController.getAll);
apiRouter.post('/customers', auth_1.authenticate, customerController.create);
apiRouter.get('/customers/:id', auth_1.authenticate, customerController.getById);
apiRouter.patch('/customers/:id', auth_1.authenticate, customerController.update);
apiRouter.get('/customers/:id/history', auth_1.authenticate, customerController.getHistory);
// Policy routes
apiRouter.get('/policies', auth_1.authenticate, policyController.getAll);
apiRouter.post('/policies', auth_1.authenticate, policyController.create);
apiRouter.get('/policies/:id', auth_1.authenticate, policyController.getById);
apiRouter.patch('/policies/:id', auth_1.authenticate, policyController.update);
apiRouter.post('/policies/:id/activate', auth_1.authenticate, policyController.activate);
apiRouter.post('/policies/:id/cancel', auth_1.authenticate, policyController.cancel);
apiRouter.post('/policies/:id/renew', auth_1.authenticate, policyController.renew);
apiRouter.get('/policies/expiring-soon', auth_1.authenticate, policyController.getExpiringSoon);
// Claim routes
apiRouter.get('/claims', auth_1.authenticate, claimController.getAll);
apiRouter.post('/claims', auth_1.authenticate, claimController.create); // Customer only in controller
apiRouter.get('/claims/:id', auth_1.authenticate, claimController.getById);
apiRouter.patch('/claims/:id/status', auth_1.authenticate, claimController.updateStatus);
apiRouter.get('/claims/:id/timeline', auth_1.authenticate, claimController.getTimeline);
// Payment routes
apiRouter.get('/payments', auth_1.authenticate, paymentController.getAll);
apiRouter.post('/payments', auth_1.authenticate, paymentController.create); // Idempotency checked in service
apiRouter.get('/payments/:id', auth_1.authenticate, paymentController.getById);
apiRouter.post('/payments/:id/mark-paid', auth_1.authenticate, paymentController.markAsPaid);
apiRouter.get('/payments/overdue', auth_1.authenticate, paymentController.getOverdue);
// Document routes
apiRouter.post('/documents/upload', auth_1.authenticate, documentController.upload);
apiRouter.get('/documents/:id', auth_1.authenticate, documentController.getById);
apiRouter.get('/documents/:id/download', auth_1.authenticate, documentController.download);
apiRouter.delete('/documents/:id', auth_1.authenticate, documentController.delete);
// Report routes (admin/agent only)
apiRouter.get('/reports/overview', auth_1.authenticate, reportController.getOverview);
apiRouter.get('/reports/policies', auth_1.authenticate, reportController.getPoliciesReport);
apiRouter.get('/reports/claims', auth_1.authenticate, reportController.getClaimsReport);
apiRouter.get('/reports/payments', auth_1.authenticate, reportController.getPaymentsReport);
apiRouter.get('/reports/customer-growth', auth_1.authenticate, reportController.getCustomerGrowthReport);
apiRouter.get('/reports/export/pdf', auth_1.authenticate, reportController.exportPdf);
apiRouter.get('/reports/export/excel', auth_1.authenticate, reportController.exportExcel);
// Notification routes
apiRouter.get('/notifications', auth_1.authenticate, notificationController.getAll);
apiRouter.patch('/notifications/:id/read', auth_1.authenticate, notificationController.markAsRead);
apiRouter.patch('/notifications/read-all', auth_1.authenticate, notificationController.markAllAsRead);
// Audit logs (admin only)
apiRouter.get('/audit-logs', auth_1.authenticate, (0, auth_2.authorize)(['ADMIN']), notificationController.getAuditLogs);
// Mount API router
app.use('/api/v1', apiRouter);
// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: {
            code: 'NOT_FOUND',
            message: `Route ${req.originalUrl} not found`
        }
    });
});
// Error handler (must be last)
app.use(errorHandler_1.errorHandler);
exports.default = app;
