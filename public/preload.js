const { ipcRenderer, contextBridge } = require("electron");
contextBridge.exposeInMainWorld("sendToMainProcess", ipcRenderer.send);
contextBridge.exposeInMainWorld("sendToPreload", (data) => {
    console.log(data);
});






