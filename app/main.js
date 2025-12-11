const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { exec } = require("child_process");
const axios = require("axios");

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            nodeIntegration: false,
            contextIsolation: true,
        },
    });

    win.loadFile(path.join(__dirname, "renderer", "index.html"));
}

app.whenReady().then(() => {
    // ▶ Пуска Python backend автоматично
    exec("python ../backend/server.py", (error) => {
        if (error) console.log("Python backend error:", error);
    });

    createWindow();

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});

// ▶ Свързване на Electron → Python backend
ipcMain.handle("send-message", async (event, userMessage) => {
    try {
        const response = await axios.post("http://127.0.0.1:5000/chat", {
            message: userMessage,
        });

        return response.data.reply;
    } catch (err) {
        console.error("Backend error:", err.message);
        return "⚠ Backend not running.";
    }
});

// ▶ Screenshot request (готово за бъдеща функция)
ipcMain.handle("take-screenshot", async () => {
    try {
        const response = await axios.get("http://127.0.0.1:5000/screenshot");
        return response.data.image;
    } catch (err) {
        return null;
    }
});
