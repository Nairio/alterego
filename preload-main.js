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

        deleteGroup: async (group) => confirm("Delete?") && send("deleteGroup", group),
        deleteItem: async (item) => confirm("Delete?") && send("deleteItem", item),
        addEditItem: async (item) => send("addEditItem", item),
        addEditGroup: async (group) => send("addEditGroup", group),
        saveGroups: async (groups) => send("saveGroups", groups),
        saveItems: async (items) => send("saveItems", items),
        getFields: (id) => send("getFields", id),
        onNavigate: (url) => send("onNavigate", url),
        openScriptFile: (scriptfile) => send("openScriptFile", scriptfile),
        openDownloadDirectory: () => send("openDownloadDirectory"),
        setSelectedItemId: (id) => ipcRenderer.send("setSelectedItemId", id),
        setSelectedGroupId: (id) => ipcRenderer.send("setSelectedGroupId", id),
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






