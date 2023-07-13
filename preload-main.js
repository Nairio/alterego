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
        deleteItem: async (item) => confirm("Delete?") && send("deleteItem", item),
        addItem: async (item) => send("addItem", item),
        editItem: async (item) => send("editItem", {item}),
        saveItems: async (items) => send("saveItems", items),
        getDataItems: (id) => send("getDataItems", id),
        onNavigate: (url) => send("onNavigate", url),
        openScriptFile: (scriptfile) => send("openScriptFile", scriptfile),
        openDownloadDirectory: () => send("openDownloadDirectory"),
        onSettings: (func) => ipcRenderer.on("onSettings", (e, d) => func(d)),
        getSettings: (func) => {
            ipcRenderer.send("getSettings");
            ipcRenderer.on("getSettings-reply", (event, data) => func(data));
        },
        setSelectedItemId: (id) =>{
            ipcRenderer.send("setSelectedItemId", id);
        }
    }
})();


ipcRenderer.on("leftTop", (event) => {
    const topleft = document.querySelector(".topleft");
    const x = window.outerWidth - window.innerWidth + topleft.offsetLeft;
    const y = window.outerHeight - window.innerHeight + topleft.offsetTop;
    event.sender.send("leftTop-reply", {x, y})
});
ipcRenderer.on("confirm", (event, text) => {
    event.sender.send("confirm-reply", window.confirm(text))
});






