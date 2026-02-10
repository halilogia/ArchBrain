/**
 * ARCHBRAIN DESKTOP SHELL (Linux) - Ironclad v8.0 (Final Stability)
 */

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

// GPU & Linux Wayland Fixes
// app.disableHardwareAcceleration(); // Disabled to allow GPU offloading
app.commandLine.appendSwitch('ignore-gpu-blocklist');
app.commandLine.appendSwitch('disable-software-rasterizer');

let win;
let settingsWin;
let mcpProcess;
const mcpRequests = new Map();
let stdoutBuffer = "";

const APP_DIR = __dirname;
const PROJECT_ROOT = process.env.PROJECT_ROOT || process.cwd();
console.log(`[SHELL]: Target Project Root Identified: ${PROJECT_ROOT}`);

// --- ROBUST JSON STREAM PARSER ---
function processBuffer() {
  let startIdx;
  while ((startIdx = stdoutBuffer.indexOf('{')) !== -1) {
    let braceCount = 0;
    let endIdx = -1;
    let inString = false;

    for (let i = startIdx; i < stdoutBuffer.length; i++) {
        const char = stdoutBuffer[i];
        if (char === '"' && (i === 0 || stdoutBuffer[i - 1] !== '\\')) inString = !inString;
        if (!inString) {
            if (char === '{') braceCount++;
            else if (char === '}') braceCount--;
            if (braceCount === 0) { endIdx = i; break; }
        }
    }

    if (endIdx !== -1) {
      const jsonStr = stdoutBuffer.substring(startIdx, endIdx + 1);
      stdoutBuffer = stdoutBuffer.substring(endIdx + 1);
      try {
        const response = JSON.parse(jsonStr);
        const id = response.id ? response.id.toString() : null;
        if (id && mcpRequests.has(id)) {
          const { resolve, timer } = mcpRequests.get(id);
          clearTimeout(timer);
          mcpRequests.delete(id);
          if (response.result && response.result.content) {
            resolve(JSON.parse(response.result.content[0].text));
          } else { resolve({ error: "Empty" }); }
        }
      } catch (e) { }
    } else break;
  }
}

function startMcp() {
  if (mcpProcess) { mcpProcess.kill(); mcpProcess = null; }
  console.log("-> Activating Neurological Core...");
  mcpProcess = spawn('node', [path.join(APP_DIR, '..', 'backend', 'server.js')], {
    cwd: APP_DIR,
    env: { ...process.env, PROJECT_ROOT: PROJECT_ROOT, NODE_ENV: 'production' }
  });
  
  mcpProcess.stdout.on('data', (data) => {
    stdoutBuffer += data.toString();
    processBuffer();
  });

  mcpProcess.stderr.on('data', (data) => {
    const msg = data.toString();
    if (msg.includes("[UI_COMMAND]:")) {
      const command = msg.split("[UI_COMMAND]:")[1].trim();
      if (win) win.webContents.send('execute-ui-action', command);
    }
  });
}

// --- IPC HANDLERS (FULL RESTORATION) ---
function registerHandlers() {
  const channels = ['scan-project', 'open-settings', 'disconnect-mcp', 'sync-log', 'capture-selfie'];
  channels.forEach(ch => ipcMain.removeHandler(ch));

  ipcMain.handle('scan-project', async () => {
    return new Promise((resolve) => {
      if (!mcpProcess) return resolve({ error: "OFFLINE" });
      const id = Date.now().toString();
      const query = { jsonrpc: "2.0", id, method: "tools/call", params: { name: "analyze_project", arguments: {} } };
      const timer = setTimeout(() => { mcpRequests.delete(id); resolve({ error: "TIMEOUT" }); }, 20000);
      mcpRequests.set(id, { resolve, timer });
      mcpProcess.stdin.write(JSON.stringify(query) + "\n");
    });
  });

  ipcMain.handle('open-settings', () => {
    if (settingsWin) return settingsWin.focus();
    settingsWin = new BrowserWindow({ width: 420, height: 600, parent: win, backgroundColor: '#020617', webPreferences: { nodeIntegration: true, contextIsolation: false } });
    settingsWin.loadFile(path.join(APP_DIR, 'settings.html'));
    settingsWin.on('closed', () => settingsWin = null);
  });

  ipcMain.handle('sync-log', (e, m) => {
    try { fs.appendFileSync(path.join(APP_DIR, 'brain.log'), `[${new Date().toLocaleTimeString()}] ${m}\n`); } catch(e){}
    return { ok: true };
  });

  ipcMain.handle('capture-selfie', async () => {
    try {
      const image = await win.webContents.capturePage();
      const savePath = path.join(PROJECT_ROOT, 'public', 'archbrain-selfie.png');
      fs.writeFileSync(savePath, image.toPNG());
      return { path: savePath };
    } catch (e) { return { error: e.message }; }
  });

  ipcMain.handle('disconnect-mcp', () => { if (mcpProcess) mcpProcess.kill(); return { ok: true }; });
  
  ipcMain.on('update-preferences', (e, prefs) => {
    if (win && !win.isDestroyed()) win.webContents.send('apply-preferences', prefs);
  });
}

function createWindow() {
  win = new BrowserWindow({
    width: 1240, height: 900, backgroundColor: '#020205',
    webPreferences: { nodeIntegration: true, contextIsolation: false }
  });
  win.loadFile(path.join(APP_DIR, '..', 'dist', 'index.html'));
  startMcp();
}

app.whenReady().then(() => {
  registerHandlers();
  createWindow();
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
