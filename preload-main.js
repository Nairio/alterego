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
        deleteItem: async (index) => confirm("Delete?") && send("deleteItem", index),
        addItem: async (item) => send("addItem", item),
        editItem: async (item, index) => send("editItem", {item, index}),
        getDataItems: (index) => send("getDataItems", index),
        onNavigate: (url) => send("onNavigate", url),
        openScriptFile: (scriptfile) => send("openScriptFile", scriptfile),
        openDownloadDirectory: () => send("openDownloadDirectory"),
        onCardToggle: (func) => ipcRenderer.on("onCardToggle", (e, d) => func(d)),
        getCardOpen: async () => await send("getCardOpen"),
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







