"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const config_1 = require("./config");
const routes_1 = __importDefault(require("./routes"));
const errorHandler_1 = require("./middleware/errorHandler");
const cron_1 = require("./services/cron");
exports.app = (0, express_1.default)();
exports.app.use((0, helmet_1.default)({ crossOriginResourcePolicy: false }));
exports.app.use((0, cors_1.default)({
    origin: true,
    credentials: true,
}));
exports.app.use((0, morgan_1.default)('dev'));
exports.app.use(express_1.default.json());
exports.app.use(express_1.default.urlencoded({ extended: true }));
exports.app.use((0, cookie_parser_1.default)());
// Base health check
exports.app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
exports.app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// API Routes multi-prefix mounting for Vercel serverless routing resilience
exports.app.use('/api/v1', routes_1.default);
exports.app.use('/v1', routes_1.default);
exports.app.use('/api', routes_1.default);
exports.app.use('/', routes_1.default);
// Error Handler
exports.app.use(errorHandler_1.errorHandler);
// Start server if executed directly
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    exports.app.listen(config_1.config.port, () => {
        console.log(`🚀 InsureCore API Server listening on port ${config_1.config.port} [${config_1.config.nodeEnv}]`);
        (0, cron_1.initCronJobs)();
    });
}
exports.default = exports.app;
