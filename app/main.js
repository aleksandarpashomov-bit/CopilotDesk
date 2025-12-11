const { app, BrowserWindow, ipcMain, desktopCapturer } = require('electron');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

function createWindow() {
    const win = new BrowserWindow({
        width: 1300,
        height: 900,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    win.loadFile(path.join(__dirname, "index.html"));
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


// -------------------- SCREENSHOT CAPTURE --------------------

ipcMain.handle("capture-screen", async () => {
    const sources = await desktopCapturer.getSources({ types: ["screen"] });
    const screen = sources[0];
    return screen.thumbnail.toPNG().toString("base64");
});


// -------------------- GPT-4o VISION REQUEST --------------------

ipcMain.handle("analyze-image", async (event, base64Image, userPrompt) => {
    try {
        const promptText = userPrompt || "Explain what you see on the screen.";

        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-4o",
                messages: [
                    {
                        role: "user",
                        content: [
                            { type: "text", text: promptText },
                            { type: "image_url", image_url: `data:image/png;base64,${base64Image}` }
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

    } catch (error) {
        return "Error: " + error.message;
    }
});
