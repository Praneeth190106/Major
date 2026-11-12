require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { runOsintScan } = require('./controllers/osintController');
const { getSystemBattery } = require('./controllers/systemController');
const { 
    getNetworkInfo, 
    transmitPackage, 
    forwardInterceptedPackage,
    getInbox, 
    acknowledgePackage, 
    clearInbox,
    registerIdentity,
    getIdentity,
    getAlerts,
    clearAlerts,
    receiveAlert,
    getAttackLog
} = require('./controllers/lanController');

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

app.use(cors());
// Increased body parser limit to 100MB for large 600KB+ PDF/DOCX document transmissions
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// ── API Routes (must be declared BEFORE the static file catch-all) ──

// System Battery Telemetry Route
app.get('/api/system/battery', getSystemBattery);

// OSINT Scan Route
app.get('/api/osint/scan', runOsintScan);

// LAN Dual-Node Routes
app.get('/api/network-info', getNetworkInfo);
app.post('/api/transmit', transmitPackage);
app.post('/api/intercept/forward', forwardInterceptedPackage);
app.get('/api/inbox', getInbox);
app.post('/api/inbox/:id/ack', acknowledgePackage);
app.delete('/api/inbox/clear', clearInbox);

// Node PQC Identity Exchange Routes
app.post('/api/identity', registerIdentity);
app.get('/api/identity', getIdentity);

// Intrusion Alerts & Attack Terminal Telemetry
app.get('/api/alerts', getAlerts);
app.delete('/api/alerts/clear', clearAlerts);
app.post('/api/alerts/notify', receiveAlert);
app.get('/api/attack-log', getAttackLog);

// ── Serve React Frontend (Production Build) ──
// In production Render/cloud: serve the Vite-built frontend/dist folder.
// In local dev: Vite runs its own dev server on :5173 with its own /api proxy.
const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(frontendDist));

// SPA fallback: any non-API route serves index.html so React Router works
app.get('*', (req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
});

app.listen(PORT, HOST, () => {
    console.log(`=================================================`);
    console.log(`🛡️  QuantumShield PQC LAN Server active`);
    console.log(`📡 Listening on 0.0.0.0:${PORT} (LAN reachable)`);
    console.log(`=================================================`);
});
