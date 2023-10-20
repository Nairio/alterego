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
        clearCache: async (group) => confirm("Clear cache?") && send("clearCache", group),
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
    const topleft = document.querySelector(".top-left");
    const x = window.outerWidth - window.innerWidth + topleft.offsetLeft;
    const y = window.outerHeight - window.innerHeight + topleft.offsetTop;
    event.sender.send("leftTop-reply", {x, y})
});
ipcRenderer.on("confirm", (event, text) => {
    event.sender.send("confirm-reply", window.confirm(text))
});


let stopFindInPage, findInPage, created, div, button, input, span;

const create = () => {
    div = document.body.appendChild(document.createElement("div"));
    div.setAttribute("style", "padding:4px; border:solid 1px #000; position: absolute; background: #fff; right: 8px; top: 58px; z-index: 10000");
    button = div.appendChild(document.createElement("button"));
    span = div.appendChild(document.createElement("span"));
    div.setAttribute("style", "margin:4px");

    button.innerHTML = "x";
    button.onclick = () => {
        div.style.display = "none";
        stopFindInPage();
    }
    input = div.appendChild(document.createElement("input"));
    input.onkeyup = (e) => e.code==="Enter" && findInPage(input.value);
}


ipcRenderer.on("found-in-page", (event, result) => {
    span.innerText = `${result.activeMatchOrdinal}/${result.matches}`;
    console.log(result);
    input.focus()
});
ipcRenderer.on("find", (event, text) => {
    !created && create();
    div.style.display = "block";
    input.focus();
    stopFindInPage = () => event.sender.send("find-stopFindInPage");
    findInPage = (text) => event.sender.send("find-findInPage", text);
});






