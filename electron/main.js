const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let serverProcess;

function startServer() {
  return new Promise((resolve) => {
    const isProd = process.env.NODE_ENV === 'production';
    
    if (isProd) {
      serverProcess = spawn('node', ['./server.js'], {
        cwd: __dirname,
        stdio: 'pipe'
      });
    } else {
      serverProcess = spawn('bun', ['run', 'start'], {
        cwd: __dirname,
        stdio: 'pipe'
      });
    }

    serverProcess.stdout.on('data', (data) => {
      console.log(data.toString());
      if (data.toString().includes('Ready in') || data.toString().includes('started server')) {
        setTimeout(resolve, 2000);
      }
    });

    serverProcess.stderr.on('data', (data) => {
      console.error(data.toString());
    });
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    icon: path.join(__dirname, 'public/icon.ico'),
  });

  const isProd = process.env.NODE_ENV === 'production';
  
  if (isProd) {
    mainWindow.loadFile(path.join(__dirname, 'out/index.html'));
  } else {
    mainWindow.loadURL('http://localhost:3000');
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  await startServer();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});