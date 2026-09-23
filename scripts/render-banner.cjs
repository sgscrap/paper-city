/* eslint-disable @typescript-eslint/no-require-imports */
// Renders docs/social-banner.html to docs/social-banner.png (1280x640) using Electron.
const { app, BrowserWindow } = require('electron');
const path = require('node:path');

app.whenReady().then(async () => {
    const win = new BrowserWindow({
        width: 1280,
        height: 640,
        show: false,
        webPreferences: { offscreen: true }
    });
    await win.loadFile(path.join(__dirname, '..', 'docs', 'social-banner.html'));
    await new Promise((r) => setTimeout(r, 600)); // let fonts/effects settle
    const image = await win.webContents.capturePage();
    require('node:fs').writeFileSync(
        path.join(__dirname, '..', 'docs', 'social-banner.png'),
        image.toPNG()
    );
    console.log('BANNER WRITTEN');
    app.quit();
});
