/* eslint-disable @typescript-eslint/no-require-imports */
const { app, BrowserWindow, dialog } = require('electron');
const { spawn } = require('node:child_process');
const http = require('node:http');
const path = require('node:path');

const PORT = Number(process.env.PAPER_CITY_PORT || 3000);
const HOST = '127.0.0.1';
const isPackaged = app.isPackaged;
const isProduction = isPackaged || process.argv.includes('--production');
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
let serverProcess;
let mainWindow;

const waitForServer = (url, attempts = 80) => new Promise((resolve, reject) => {
    const tryRequest = (remaining) => {
        const request = http.get(url, (response) => {
            response.resume();
            if (response.statusCode && response.statusCode < 500) {
                resolve();
                return;
            }
            retry(remaining);
        });

        request.on('error', () => retry(remaining));
        request.setTimeout(1000, () => {
            request.destroy();
            retry(remaining);
        });
    };

    const retry = (remaining) => {
        if (remaining <= 0) {
            reject(new Error(`Paper City did not start at ${url}`));
            return;
        }
        setTimeout(() => tryRequest(remaining - 1), 250);
    };

    tryRequest(attempts);
});

const startNextServer = () => {
    const projectRoot = path.resolve(__dirname, '..');
    let command;
    let commandArgs;
    let cwd = projectRoot;
    let env = { ...process.env, BROWSER: 'none' };

    if (isPackaged) {
        // Packaged builds do not assume that Node.js or npm is installed on the player machine.
        // Next's standalone server is copied outside the app archive so Electron can run it directly.
        const packagedRoot = path.join(process.resourcesPath, 'paper-city-server');
        const serverScript = path.join(packagedRoot, 'server.js');
        command = process.execPath;
        commandArgs = [serverScript];
        cwd = packagedRoot;
        env = {
            ...env,
            ELECTRON_RUN_AS_NODE: '1',
            NODE_ENV: 'production',
            NODE_PATH: path.join(process.resourcesPath, 'app.asar', 'node_modules'),
            NEXT_TELEMETRY_DISABLED: '1',
            HOSTNAME: HOST,
            PORT: String(PORT)
        };
    } else {
        const nextScript = isProduction ? 'start' : 'dev';
        const devBundlerArgs = isProduction ? [] : ['--webpack'];
        const args = ['run', nextScript, '--', ...devBundlerArgs, '--hostname', HOST, '--port', String(PORT)];
        command = process.platform === 'win32'
            ? (process.env.ComSpec || 'cmd.exe')
            : npmCommand;
        commandArgs = process.platform === 'win32'
            ? ['/d', '/s', '/c', [npmCommand, ...args].join(' ')]
            : args;
    }

    serverProcess = spawn(command, commandArgs, {
        cwd,
        env,
        stdio: 'inherit',
        windowsHide: true
    });

    serverProcess.on('error', (error) => {
        dialog.showErrorBox('Paper City failed to start', error.message);
        app.quit();
    });

    serverProcess.on('exit', (code) => {
        if (code && !app.isQuitting) {
            dialog.showErrorBox('Paper City server stopped', `The local game server exited with code ${code}.`);
            app.quit();
        }
    });
};

const getBrandAssetPath = () => isPackaged
    ? path.join(process.resourcesPath, 'paper-city-server', 'public', 'paper-city-sigil.svg')
    : path.join(path.resolve(__dirname, '..'), 'public', 'paper-city-sigil.svg');

const stopNextServer = () => {
    if (!serverProcess || serverProcess.killed) return;

    if (process.platform === 'win32') {
        spawn('taskkill', ['/pid', String(serverProcess.pid), '/f', '/t'], { windowsHide: true });
    } else {
        serverProcess.kill('SIGTERM');
    }
    serverProcess = undefined;
};

const createWindow = async () => {
    startNextServer();

    try {
        await waitForServer(`http://${HOST}:${PORT}`);
    } catch (error) {
        dialog.showErrorBox('Paper City failed to start', error.message);
        app.quit();
        return;
    }

    mainWindow = new BrowserWindow({
        width: 1440,
        height: 900,
        minWidth: 1024,
        minHeight: 700,
        backgroundColor: '#050505',
        icon: getBrandAssetPath(),
        autoHideMenuBar: true,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: true
        }
    });

    mainWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription, validatedURL) => {
        console.error(`[renderer-load] ${errorCode} ${errorDescription} ${validatedURL}`);
    });
    mainWindow.webContents.on('render-process-gone', (_event, details) => {
        console.error(`[renderer-gone] ${details.reason} ${details.exitCode}`);
    });

    mainWindow.loadURL(`http://${HOST}:${PORT}`);
};

app.whenReady().then(createWindow).catch((error) => {
    dialog.showErrorBox('Paper City failed to start', error.message);
    stopNextServer();
    app.quit();
});

app.on('window-all-closed', () => {
    stopNextServer();
    if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', stopNextServer);
app.on('will-quit', stopNextServer);
