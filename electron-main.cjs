// electron-main.cjs
// Main process for Electron app (CommonJS so require() works despite "type": "module" in package.json)

const { app, BrowserWindow } = require('electron');
const path = require('path');

// In .cjs modules Node provides __dirname automatically — do not redeclare it.

// Determine if we are running in development (unpackaged) or production (packaged)
const isDev = !app.isPackaged;

let mainWindow;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      // Keep full web security in dev; relax only in packaged build so file:// assets load correctly
      webSecurity: isDev,
    },
    icon: path.join(__dirname, 'assets', 'icon.png'), // Optional: add an icon
  });

  // Load the app: when unpackaged use Vite dev server; when packaged use built dist/
  if (isDev) {
    // Development: load from Vite dev server (run via "npm run electron:dev")
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    // Production: load from built Vite output (dist/)
    const indexPath = path.join(__dirname, 'dist', 'index.html');
    mainWindow.loadFile(indexPath);
  }

  // Emitted when the window is closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    // On macOS, re-create window when dock icon is clicked
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
  // On macOS, keep app running even when all windows are closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
