
/* global process */
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import fs from "fs";
import path from "path";
import express from "express";
import { WebSocketServer } from "ws";
import http from "http";
import chokidar from "chokidar";
import cors from "cors";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



const projectRoot = process.env.PROJECT_ROOT || process.cwd();
const app = express();
app.use(cors());
const serverHttp = http.createServer(app);
let wss = null;

const systemLogs = [`> [${new Date().toLocaleTimeString()}] Neural Systems Initiated...`];

let broadcast = (data) => {
    if (data.type === 'LOG' && data.message) {
        console.error(`[SENTINEL_HUB]: Broadcaster - ${data.message}`);
        systemLogs.push(`> [${new Date().toLocaleTimeString()}] ${data.message}`);
        if (systemLogs.length > 100) systemLogs.shift();
    }
    if (wss) {
        wss.clients.forEach(client => {
            if (client.readyState === 1) client.send(JSON.stringify(data));
        });
    }
};

// --- WATCHER ---
let watchActive = true;
let mcpActive = true;

const _watcher = chokidar.watch(path.join(projectRoot, 'src'), { ignoreInitial: true, awaitWriteFinish: true })
    .on('all', (event, filePath) => {
        if (watchActive) {
            console.error(`[SENTINEL]: Neural shift detected (${event}: ${path.basename(filePath)}).`);
            broadcast({ type: 'COMMAND', action: 'SCAN' });
        }
    });

// --- NEURAL FILE BRIDGE ---
const bridgeFile = path.join(projectRoot, 'sentinel_bridge.json');
if (!fs.existsSync(bridgeFile)) fs.writeFileSync(bridgeFile, JSON.stringify({ message: "Neural Link Initialized" }));

chokidar.watch(bridgeFile, { awaitWriteFinish: true }).on('change', () => {
    console.error(`[SENTINEL]: Bridge file change detected.`);
    try {
        const data = JSON.parse(fs.readFileSync(bridgeFile, 'utf8'));
        if (data.message) {
            console.error(`[SENTINEL]: Broadcasting bridge message: ${data.message}`);
            broadcast({ type: 'LOG', message: `🔱 AI COMMANDER (via Bridge): ${data.message}` });
        }
        if (data.action) {
            broadcast({ type: 'COMMAND', action: data.action });
        }
    } catch (err) {
        console.error(`[SENTINEL]: Bridge error: ${err.message}`);
    }
});

// 100% CONTENT-ONLY ANALYSIS (No file names, no folder paths)
const determineLayer = (_, content) => {
    const lowerContent = content.toLowerCase();
    
    // --- NEURAL CONTENT DETECTIVE (DNA-Based) ---

    // 2. Infrastructure DNA (Data Source, API, FS, DB, Storage Hooks)
    if (lowerContent.includes('axios') || 
        lowerContent.includes('fetch') || 
        lowerContent.includes('localstorage') || 
        lowerContent.includes('sessionstorage') ||
        lowerContent.includes(' mongoose') ||
        lowerContent.includes('from "fs"') ||
        lowerContent.includes('indexeddb')) {
        return 'Infrastructure';
    }

    // 1. Presentation DNA (UI, Components, View Logic)
    // EXCEPTION: Hooks that are purely logic (no JSX) shouldn't be Presentation unless they return UI
    if ((lowerContent.includes('react') || 
        lowerContent.includes('jsx') || 
        lowerContent.includes('styled-components') ||
        lowerContent.includes('framer-motion') ||
        lowerContent.includes('lucide-react')) && 
        !lowerContent.includes('localstorage')) { // Infra takes precedence
        return 'Presentation';
    }

    // 3. Domain DNA (Pure Logic, Entities, Interfaces)
    // Rule: Must define structures but NOT use outside libraries
    if ((lowerContent.includes('interface ') || lowerContent.includes('type ') || lowerContent.includes('enum ')) &&
        !lowerContent.includes('react') && 
        !lowerContent.includes('axios') &&
        !lowerContent.includes('express')) {
        return 'Domain';
    }

    // 4. Application DNA (Use Cases, Services, Logic Orchestration)
    return 'Application'; 
};

// --- DATA ENGINE ---
function getAnalysis() {
    const srcPath = path.join(projectRoot, 'src');
    const nodes = [];
    const edges = [];

    const scanDir = (dir) => {
      if (!fs.existsSync(dir)) return;
      fs.readdirSync(dir).forEach(item => {
        const fullPath = path.join(dir, item);
        const relPath = path.relative(projectRoot, fullPath).replace(/\\/g, '/');
        if (fs.statSync(fullPath).isDirectory()) {
          if (item !== 'node_modules' && !item.startsWith('.')) scanDir(fullPath);
        } else if (['.ts', '.tsx', '.js', '.jsx'].includes(path.extname(item))) {
                try {
                    const content = fs.readFileSync(fullPath, 'utf8');
                    nodes.push({ id: relPath, label: item, category: determineLayer(relPath, content), content });
                } catch (err) {
                    console.error(`[SENTINEL]: Analysis error on ${relPath}: ${err.message}`);
                }
            }
        });
    };

    scanDir(srcPath);

    const layerRank = { 'Domain': 0, 'Application': 1, 'Infrastructure': 2, 'Presentation': 3 };

    nodes.forEach(node => {
        // Regex 1: Static Imports (import ... from 'path')
        const staticImportRegex = /from\s+['"]([^'"]+)['"]/g;
        // Regex 2: Dynamic Imports (import('path') or require('path')) - For React.lazy
        const dynamicImportRegex = /(?:import|require)\s*\(\s*['"]([^'"]+)['"]\s*\)/g;

        const findDependency = (regex) => {
            let match;
            while ((match = regex.exec(node.content)) !== null) {
                let targetPath = match[1];
            
                let target = nodes.find(n => {
                    if (targetPath.startsWith('.')) {
                        const resolved = path.join(path.dirname(node.id), targetPath).replace(/\\/g, '/');
                        return n.id.startsWith(resolved);
                    }
                    return n.id.includes(targetPath);
                });

                if (target && target.id !== node.id) {
                    node.outDegree++;
                    
                    // DEPENDENCY RULE: Source Rank >= Target Rank (Can only point INWARDS)
                    const sourceRank = layerRank[node.category];
                    const targetRank = layerRank[target.category];
                    const isViolation = sourceRank < targetRank;

                    edges.push({ 
                        source: node.id, 
                        target: target.id, 
                        violation: isViolation 
                    });
                }
            }
        };

        node.outDegree = 0;
        node.inDegree = 0;

        findDependency(staticImportRegex);
        findDependency(dynamicImportRegex);
    });

    // Summary Stats
    edges.forEach(edge => {
        const targetNode = nodes.find(n => n.id === edge.target);
        if (targetNode) targetNode.inDegree++;
    });

    nodes.forEach(node => {
        node.criticality = (node.inDegree || 0) + (node.outDegree || 0);
        node.isOrphan = (node.criticality === 0);
    });

    return { nodes, edges };
}

// --- MCP SERVER SETUP ---
const mcpServer = new Server({ name: "arch-brain", version: "3.9.0" }, { capabilities: { tools: {} } });

mcpServer.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      { 
        name: "analyze_project", 
        description: "Deep architectural scan of the codebase.",
        inputSchema: { type: "object", properties: {} }
      },
      {
        name: "get_system_status",
        description: "Get real-time Sentinel metrics (Uptime, Watcher status, MCP status).",
        inputSchema: { type: "object", properties: {} }
      },
      {
        name: "control_sentinel_service",
        description: "Toggle Sentinel services (WATCHER or MCP).",
        inputSchema: {
          type: "object",
          properties: {
            service: { type: "string", enum: ["WATCHER", "MCP"] }
          },
          required: ["service"]
        }
      },
      {
        name: "get_sentinel_logs",
        description: "Read the current history of the Sentinel HUD logs.",
        inputSchema: { type: "object", properties: {} }
      },
      {
        name: "write_to_sentinel_log",
        description: "Write a message directly to the Sentinel HUD log panel.",
        inputSchema: {
          type: "object",
          properties: {
            message: { type: "string", description: "The message to display in the UI log." }
          },
          required: ["message"]
        }
      },
      { 
        name: "trigger_ui_action", 
        description: "Remote control UI actions.",
        inputSchema: {
          type: "object",
          properties: { action: { type: "string" } },
          required: ["action"]
        }
      }
    ],
}));



mcpServer.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    if (name === "analyze_project") {
        const data = getAnalysis();
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }

    if (name === "get_system_status") {
        if (!isHub) {
            try {
                const res = await fetch(`http://127.0.0.1:${PORT}/api/status`);
                const data = await res.json();
                return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
            } catch (e) {}
        }
        const status = { uptime: process.uptime(), watcher: watchActive ? 'ACTIVE' : 'SLEEPING', mcp: mcpActive ? 'ONLINE' : 'OFFLINE' };
        return { content: [{ type: "text", text: JSON.stringify(status, null, 2) }] };
    }

    if (name === "control_sentinel_service") {
        if (!isHub) {
            await forwardToHub('/api/command', { action: args.service === 'WATCHER' ? 'TOGGLE_WATCHER' : 'TOGGLE_MCP' });
            return { content: [{ type: "text", text: `Forwarding command to Hub...` }] };
        }
        if (args.service === "WATCHER") watchActive = !watchActive;
        if (args.service === "MCP") mcpActive = !mcpActive;
        const msg = `${args.service} is now ${args.service === "WATCHER" ? (watchActive ? 'ACTIVE' : 'SLEEPING') : (mcpActive ? 'ONLINE' : 'OFFLINE')}`;
        return { content: [{ type: "text", text: msg }] };
    }

    if (name === "write_to_sentinel_log") {
        await forwardToHub('/api/log', { message: args.message });
        return { content: [{ type: "text", text: `Success` }] };
    }

    if (name === "get_sentinel_logs") {
        if (!isHub) {
            try {
                const res = await fetch(`http://127.0.0.1:${PORT}/api/logs`);
                const data = await res.json();
                return { content: [{ type: "text", text: data.logs.join('\n') }] };
            } catch (e) {}
        }
        return { content: [{ type: "text", text: systemLogs.join('\n') }] };
    }

    if (name === "trigger_ui_action") {
        await forwardToHub('/api/command', { action: args.action });
        return { content: [{ type: "text", text: `Action ${args.action} triggered.` }] };
    }
    throw new Error("Tool not found");
});

// --- EXPRESS API ---
app.get('/api/scan', (req, res) => res.json(getAnalysis()));
app.post('/api/scan-internal', (req, res) => res.json(getAnalysis())); // For MCP Bridge
app.get('/api/status', (req, res) => res.json({ 
    uptime: process.uptime(), 
    watcher: watchActive ? 'ACTIVE' : 'SLEEPING', 
    mcp: mcpActive ? 'ONLINE' : 'OFFLINE' 
}));
app.get('/api/logs', (req, res) => res.json({ logs: systemLogs }));

app.post('/api/log', express.json(), (req, res) => {
    broadcast({ type: 'LOG', message: req.body.message });
    res.json({ success: true });
});

app.post('/api/command', express.json(), (req, res) => {
    broadcast({ type: 'COMMAND', action: req.body.action });
    res.json({ success: true });
});

app.post('/api/toggle-watcher', (req, res) => {
    watchActive = !watchActive;
    res.json({ success: true, status: watchActive ? 'ACTIVE' : 'SLEEPING' });
});

app.post('/api/toggle-mcp', (req, res) => {
    mcpActive = !mcpActive;
    res.json({ success: true, status: mcpActive ? 'ONLINE' : 'OFFLINE' });
});

app.post('/api/restart', (req, res) => {
    console.error("Tactical Restart Initiated via Sentinel UI.");
    res.json({ success: true, message: "Server rebooting..." });
    setTimeout(() => {
        process.exit(0); 
    }, 200);
});
app.use(express.static(path.join(__dirname, '..', 'dist'))); 

// --- START ---
const PORT = 5050;

const stdioTransport = new StdioServerTransport();

let isHub = false;

if (process.env.MCP_ONLY) {
    console.error("SENTINEL: Shadow Mode Active (MCP Only)");
} else {
    // Create WebSocket server only if we aren't in Shadow Mode
    wss = new WebSocketServer({ noServer: true });

    serverHttp.on('upgrade', (request, socket, head) => {
        const pathname = request.url.split('?')[0];
        if (pathname === '/mcp' || pathname === '/ws' || pathname === '/') {
            wss.handleUpgrade(request, socket, head, (ws) => {
                wss.emit('connection', ws, request);
            });
        }
    });

    wss.on('connection', (ws, req) => {
        const url = req.url.split('?')[0];
        console.error(`[SENTINEL]: New Connection (${url})`);
        
        if (url === '/mcp') {
            const wsTransport = {
                onclose: null,
                onerror: null,
                onmessage: null,
                start: () => Promise.resolve(),
                send: (msg) => new Promise((resolve) => {
                    if (ws.readyState === 1) ws.send(JSON.stringify(msg));
                    resolve();
                }),
                close: () => new Promise((resolve) => {
                    ws.close();
                    resolve();
                })
            };

            ws.on('message', (data) => {
                try {
                    const message = JSON.parse(data.toString());
                    wsTransport.onmessage?.(message);
                } catch { 
                    /* Malformed JSON ignored */
                }
            });
            
            ws.on('close', () => wsTransport.onclose?.());
            ws.on('error', (err) => wsTransport.onerror?.(err));
            
            mcpServer.connect(wsTransport).catch(() => {});
        } else {
            // General Broadcast WS handling for UI
            console.error(`[SENTINEL_HUB]: UI Client Connected! (Total: ${wss.clients.size})`);
            ws.on('message', () => { });
            ws.send(JSON.stringify({ type: 'LOG', message: "Neural Link Synchronized with Hub." }));
        }
    });

    // Handle manual broadcast
    // Re-bind broadcast function to use the new wss
    broadcast = (data) => {
        if (data.type === 'LOG' && data.message) {
            console.error(`[SENTINEL_HUB]: Broadcaster - ${data.message}`);
            systemLogs.push(`> [${new Date().toLocaleTimeString()}] ${data.message}`);
            if (systemLogs.length > 100) systemLogs.shift();
        }
        if (wss) {
            const clientCount = wss.clients.size;
            if (clientCount > 0) {
                wss.clients.forEach(client => {
                    if (client.readyState === 1) client.send(JSON.stringify(data));
                });
            } else if (data.type === 'LOG') {
                console.error(`[SENTINEL_HUB]: No UI clients connected. Message buffered.`);
            }
        }
    };

    serverHttp.listen(PORT, () => {
        isHub = true; // We are the Hub!
        console.error(`ArchBrain Web UI: http://localhost:${PORT}`);
        console.error(`[SENTINEL]: System Operational. Analysis Engine Ready.`);
    }).on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.error("[SENTINEL]: Hub active on 5050. Tool Forwarding mode enabled.");
        } else {
            console.error("[SENTINEL]: Server Error:", err.message);
            process.exit(1);
        }
    });
}

// --- TOOL FORWARDING (Bridges isolated shadow processes to the main hub via HTTP) ---
const forwardToHub = (path, body) => {
    // If we are the Hub, just broadcast locally
    if (isHub) {
        broadcast(path === '/api/log' ? { type: 'LOG', message: body.message } : { type: 'COMMAND', action: body.action });
        return Promise.resolve();
    }

    // If we are a tool child, forward to the Hub
    return new Promise((resolve) => {
        const data = JSON.stringify(body);
        const req = http.request({
            hostname: '127.0.0.1',
            port: PORT,
            path: path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        }, () => resolve());
        req.on('error', () => {
            console.error("[SENTINEL]: Hub unreachable. Dropping package.");
            resolve();
        });
        req.write(data);
        req.end();
    });
};

// --- FINAL CATCH-ALL FOR SPA (Must come AFTER API routes) ---
app.use((req, res) => {
    res.sendFile(path.join(__dirname, '..', 'dist/index.html'));
});

// FINAL CONNECTION
await mcpServer.connect(stdioTransport);
