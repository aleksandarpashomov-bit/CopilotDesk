const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
    captureScreen: () => ipcRenderer.invoke("capture-screen"),
    analyzeImage: (img, text) => ipcRenderer.invoke("analyze-image", img, text)
});
