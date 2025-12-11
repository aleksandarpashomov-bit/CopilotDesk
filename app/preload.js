const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
    sendMessage: (msg) => ipcRenderer.invoke("send-message", msg),
    screenshot: () => ipcRenderer.invoke("take-screenshot")
});
