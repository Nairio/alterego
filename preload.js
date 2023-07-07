const {ipcRenderer} = require("electron");
window.fileWrite = (filename, data) => {
    return new Promise(resolve => {
        ipcRenderer.send("fileWrite", {filename, data});
        ipcRenderer.on("fileWrite-reply", (event, data) => resolve(data));
    })
}
window.fileRead = (filename) => {
    return new Promise((resolve) => {
        ipcRenderer.send("fileRead", {filename});
        ipcRenderer.on("fileRead-reply", (event, data) => resolve(data));
    })
}
window.addDataItem = (item) => {
    ipcRenderer.send("addDataItem", {item, index: window.dataIndex});
}
window.getDataValue = (id) => {
    return new Promise((resolve => {
        ipcRenderer.send("getDataValue", {id, index: window.dataIndex});
        ipcRenderer.on("getDataValue-reply", (event, data) => resolve(data));
    }))
}








