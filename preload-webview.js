const {ipcRenderer} = require("electron");

window.fileWrite = (filename, data="") => {
    return new Promise(resolve => {
        ipcRenderer.send("fileWrite", {filename, data});
        ipcRenderer.on("fileWrite-reply", (event, data) => resolve(data));
    })
}
window.fileRead = (filename, defValue = "") => {
    return new Promise((resolve) => {
        ipcRenderer.send("fileRead", {filename, defValue});
        ipcRenderer.on("fileRead-reply", (event, data) => resolve(data));
    })
}
window.setFields = (fields) => {
    ipcRenderer.send("setFields", fields);
}
window.getItem = () => {
    return new Promise((resolve => {
        ipcRenderer.send("getItem");
        ipcRenderer.on("getItem-reply", (event, item) => resolve(item));
    }))
}
window.waitSelector = (selectors, speed = 1000, timeout) => {
    return new Promise((resolve => {
        const i = setInterval(() => {
            const search = document.querySelector(selectors);
            if (search) {
                clearInterval(i);
                resolve(search);
            }
        }, speed);
        timeout && setTimeout(() => {
            clearInterval(i);
            resolve(false);
        }, timeout)
    }))
}
window.waitSelectorByText = (text, speed = 1000, timeout) => {
    return new Promise((resolve => {
        const i = setInterval(() => {
            const search = Array.from(document.querySelectorAll('*')).find(el => el.innerHTML === text);
            if (search) {
                clearInterval(i);
                resolve(search);
            }
        }, speed);
        timeout && setTimeout(() => {
            clearInterval(i);
            resolve(false);
        }, timeout)

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





