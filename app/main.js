const { app, BrowserWindow, ipcMain, desktopCapturer } = require('electron');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    win.loadFile("index.html");
}

app.whenReady().then(() => {
    createWindow();
    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});

// ---------------- SCREENSHOT HANDLER ----------------

ipcMain.handle("capture-screen", async () => {
    const sources = await desktopCapturer.getSources({ types: ["screen"] });

    const screen = sources[0];

    return screen.thumbnail.toPNG().toString("base64");
});

// ---------------- GPT-4o VISION API ----------------

ipcMain.handle("analyze-image", async (event, base64Image, userText) => {
    const prompt = userText || "Help me understand this screenshot.";

    try {
        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-4o",
                messages: [
                    {
                        role: "user",
                        content: [
                            { type: "text", text: prompt },
                            {
                                type: "image_url",
                                image_url: `data:image/png;base64,${base64Image}`
                            }
                        ]
                    }
                ]
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
                }
            }
        );

        return response.data.choices[0].message.content;

    } catch (err) {
        return "Error: " + err.message;
    }
});
