const {ipcRenderer} = require("electron");

ipcRenderer.setMaxListeners(1000);

const send = (msg, data) => {
    return new Promise((resolve) => {
        ipcRenderer.send(msg, data);
        ipcRenderer.on(`${msg}-reply`, (event, data) => resolve(data));
    })
}

window.main = (() => {
    let onDataUsed = false;
    return {
        onData: (func) => {
            if (onDataUsed) return;
            ipcRenderer.send("getData");
            ipcRenderer.on("getData-reply", (event, data) => func(data));
            onDataUsed = true;
        },
        deleteItem: async (index) => send("deleteItem", index),
        addItem: async (item) => send("addItem", item),
        editItem: async (item, index) => send("editItem", {item, index}),
    }
})()





