const {ipcRenderer} = require("electron");

const send = (msg, data) => {
    return new Promise((resolve) => {
        ipcRenderer.send("main", {msg, data});
        ipcRenderer.on("main", (event, data) => resolve(data));
    })
}

window.main = {
    getButtons: async () => send("getButtons"),
    openWindow: async (data) => send("openWindow", data),
}



