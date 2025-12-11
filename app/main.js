const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const screenshot = require("screenshot-desktop");
const OpenAI = require("openai");
const client = new OpenAI({ apiKey: process.env.OPENAI_KEY });

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: { preload: path.join(__dirname, 'preload.js') }
  });

  win.loadFile(path.join(__dirname, 'renderer', 'index.html'));
}

ipcMain.handle("capture-screen", async () => {
    const img = await screenshot({ format: "png" });
    return img.toString("base64");
});

ipcMain.handle("analyze-image", async (event, base64img) => {

    const result = await client.chat.completions.create({
        model: "gpt-4o",
        messages: [
            {
                role: "user",
                content: [
                    { type: "input_text", text: "Analyze this screenshot and identify the GUI element the user most likely needs to click. Return ONLY JSON: {x: number, y: number, description: string}" },
                    { type: "input_image", image_url: `data:image/png;base64,${base64img}` }
                ]
            }
        ]
    });

    const content = result.choices[0].message.content;
    return JSON.parse(content);
});

ipcMain.handle("show-pointer", async (event, x, y) => {
    const overlay = new BrowserWindow({
        width: 60,
        height: 60,
        transparent: true,
        frame: false,
        alwaysOnTop: true,
        focusable: false
    });

    overlay.loadURL(`data:text/html;charset=utf-8,
        <style>
        body { margin:0; background:rgba(0,0,0,0); }
        .pointer {
            width:50px;
            height:50px;
            background:red;
            border-radius:50%;
            border:3px solid white;
        }
        </style>
        <div class='pointer'></div>`);

    overlay.setPosition(x - 25, y - 25);

    setTimeout(() => overlay.close(), 2300);
});

app.whenReady().then(createWindow);
