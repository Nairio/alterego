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
window.setDataItems = (items) => {
    ipcRenderer.send("setDataItems", {items});
}
window.getDataValue = (id) => {
    return new Promise((resolve => {
        ipcRenderer.send("getDataValue", {id});
        ipcRenderer.on("getDataValue-reply", (event, data) => resolve(data));
    }))
}
window.waitSelector = (selectors, speed = 1000) => {
    return new Promise((resolve => {
        const i = setInterval(() => {
            const search = document.querySelector(selectors);
            if (search) {
                clearInterval(i);
                resolve(search);
            }
        }, speed)
    }))
}
window.sleep = (microsecond = 1000) => {
    return new Promise((resolve => {
        const i = setTimeout(() => {
            clearTimeout(i);
            resolve();
        }, microsecond)
    }))
}

window.robotClick = (element) => {
    return new Promise(resolve => {
        const {width, height, top, left} = element.getBoundingClientRect();
        const x = Math.round(left + width / 2);
        const y = Math.round(top + height / 2);
        ipcRenderer.send("robotClick", {x, y});
        ipcRenderer.on("robotClick-reply", resolve);
    })
}

window.robotKeyPress = (key, modifier=[]) => {
    return new Promise(resolve => {
        ipcRenderer.send("robotKeyPress", {key, modifier});
        ipcRenderer.on("robotKeyPress-reply", resolve);
    })
}

window.robotTypeText = (text) => {
    return new Promise(resolve => {
        ipcRenderer.send("robotTypeText", text);
        ipcRenderer.on("robotTypeText-reply", resolve);
    })
}

window.getLoadIndex = () => {
    return new Promise(resolve => {
        ipcRenderer.send("getLoadIndex");
        ipcRenderer.on("getLoadIndex-reply", (e, data) => resolve(data));
    })
};





