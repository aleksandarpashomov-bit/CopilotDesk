const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld("electronAPI", {
    captureScreen: () => ipcRenderer.invoke("capture-screen"),
    analyzeImage: (img) => ipcRenderer.invoke("analyze-image", img),
    showPointer: (x,y) => ipcRenderer.invoke("show-pointer", x, y),
});
