const {ipcRenderer} = require("electron");

const send = (msg) => {
    return new Promise((resolve) => {
        ipcRenderer.send("main", msg);
        ipcRenderer.on("main", (event, data) => resolve(data));
    })
}

window.main = {
    getButtons: async () => send("getButtons"),
}



