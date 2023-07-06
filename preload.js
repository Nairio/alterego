const {ipcRenderer, contextBridge} = require("electron");

contextBridge.exposeInMainWorld("sendToMainProcess", ipcRenderer.send);
contextBridge.exposeInMainWorld("fileWrite", (filename, data, cb) => {
    ipcRenderer.send("fileWrite", {filename, data});
    ipcRenderer.send("fileWrite-reply", cb);
});
contextBridge.exposeInMainWorld("fileRead", (filename, cb) => {
    ipcRenderer.send("fileRead", {filename});
    ipcRenderer.on("fileRead-reply", cb);
});






