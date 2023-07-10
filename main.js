const {app, BrowserWindow, webContents, ipcMain, screen, Menu, MenuItem} = require("electron");
const path = require("path");
const fs = require("fs");
const {exec} = require('child_process');
const robot = require("robotjs");

const loadIndex = {};
const getDirName = (...items) => {
    const dirName = path.join(app.getPath("appData"), app.getName(), ...items);
    if (!fs.existsSync(dirName)) {
        fs.mkdirSync(dirName, {recursive: true});
    }
    return dirName;
}
const getFileName = (defVal, ...items) => {
    const filename = items.pop();
    const dirName = getDirName(...items);
    const filepath = path.join(dirName, filename);
    if (!fs.existsSync(filepath)) {
        fs.writeFileSync(filepath, defVal);
    }
    return filepath;
}
const shellExec = (fileName) => {
    let openCommand;
    if (process.platform === 'win32') {
        openCommand = `explorer "${fileName}"`;
    } else if (process.platform === 'darwin') {
        openCommand = `open "${fileName}"`;
    } else {
        openCommand = `xdg-open "${fileName}"`;
    }

    exec(openCommand, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`Command execution error: ${stderr}`);
            return;
        }
        console.log(`Command output: ${stdout}`);
    });
}
const NMenu = (win, items) => {
    const contextMenu = new Menu();
    items.forEach(([label, click]) => contextMenu.append(new MenuItem({label, click})));
    return {
        popup: (e, {x, y}) => contextMenu.popup(win, x, y)
    }
}
const NData = (() => {
    const fileName = getFileName("[]", "data.json");

    let onupdate;
    let data;

    const fileUpdated = () => {
        data = JSON.parse(fs.readFileSync(fileName, {encoding: "utf8"}));
        onupdate(data);
    }

    let setonupdate = (func) => {
        onupdate = func;
        fileUpdated();
    }

    const watcher = fs.watch(fileName, fileUpdated);

    process.on("SIGINT", () => {
        watcher.close();
        process.exit()
    });

    const addItem = async (item) => {
        data.push(item);
        fs.writeFileSync(fileName, JSON.stringify(data, null, " "));
    }

    const deleteItem = async (i) => {
        data.splice(i, 1);
        fs.writeFileSync(fileName, JSON.stringify(data, null, " "));
    }

    const editItem = async ({item, index}) => {
        data[index] = item;
        fs.writeFileSync(fileName, JSON.stringify(data, null, " "));
    }

    return {setonupdate, addItem, deleteItem, editItem, getData: () => data}
})()
const NdataItems = (() => {
    const dataItems = {};
    const setDataItems = (items, index) => dataItems[index] = items;
    return {setDataItems, getDataItems: (index) => dataItems[index]}
})()
const confirm = (mainWindow, text) => {
    return new Promise(resolve => {
        mainWindow.webContents.send("confirm", text);
        ipcMain.on("confirm-reply", (e, result) => {
            resolve(result)
        });
    })
}


ipcMain.on("getDataItems", (event, index) => {
    event.reply("getDataItems-reply", NdataItems.getDataItems(index));
});
ipcMain.on("getData", (event) => {
    NData.setonupdate((data) => event.reply("getData-reply", data));
});
ipcMain.on("addItem", async (event, item) => {
    await NData.addItem(item);
    event.reply("addItem-reply", "ok");
});
ipcMain.on("deleteItem", async (event, index) => {
    await NData.deleteItem(index);
    event.reply("deleteItem-reply", "ok");
});
ipcMain.on("editItem", async (event, {item, index}) => {
    await NData.editItem({item, index});
    event.reply("editItem-reply", "ok");
});
ipcMain.on("onNavigate", async (event, url) => {
    const originRequest = url;

    try {
        new URL(url);
    } catch (e) {
        url = `https://${url}`
    }

    try {
        await fetch(url)
    } catch (e) {
        url = `https://www.google.com/search?q=${encodeURIComponent(originRequest)}`
    }

    event.reply("onNavigate-reply", url);
});
ipcMain.on("openScriptFile", (event, scriptfile) => {
    const fileName = getFileName("", "scripts", scriptfile);
    shellExec(fileName)
});
ipcMain.on("openDownloadDirectory", () => {
    shellExec(getDirName("downloadDirectory"))
});

const onWebContents = async (index, mainWindow, webViewContents, {scriptfile, proxy, lang, useragent, coords}) => {

    if (scriptfile) {
        const fileName = getFileName("", "scripts", scriptfile);

        webViewContents.addListener("did-finish-load", () => {
            if (webViewContents.getURL() === "about:blank") return;

            loadIndex[index] = loadIndex[index] || 0;
            loadIndex[index]++;
            const script = fs.readFileSync(fileName, "utf8");
            script && webViewContents.executeJavaScript(script);
        });
    }

    const menuItems = [
        ["Reload", () => webViewContents.reload()],
        ["WebView DevTools", () => webViewContents.openDevTools()],
        ["Clear Cache", async () => {
            if (await confirm(mainWindow, "Clear Cache")) {
                await webViewContents.session.clearCache();
                await webViewContents.session.clearHostResolverCache();
                await webViewContents.session.clearAuthCache();
                await webViewContents.session.clearStorageData();
                await webViewContents.clearHistory();
                await webViewContents.reload()
            }
        }],
    ];
    webViewContents.addListener("context-menu", NMenu(mainWindow, menuItems).popup);
    webViewContents.session.setProxy({proxyRules: proxy});
    webViewContents.session.setPreloads([path.join(__dirname, "preload-webview.js")]);
    webViewContents.debugger.attach();

    (useragent && !lang) && webViewContents.session.setUserAgent(useragent);
    (useragent && lang) && webViewContents.session.setUserAgent(useragent, lang);

    webViewContents.debugger.sendCommand("Emulation.setGeolocationOverride", {
        latitude: +coords[0],
        longitude: +coords[1],
        accuracy: 1
    });

    webViewContents.ipc.on("getLoadIndex", (event) => {
        event.reply("getLoadIndex-reply", loadIndex[index])
    });
    webViewContents.ipc.on("getDataValue", (event, {id}) => {
        const items = NData.getData();
        const item = items[index];
        const value = item[id];
        event.reply("getDataValue-reply", value)
    });
    webViewContents.ipc.on("setDataItems", (event, {items}) => {
        NdataItems.setDataItems(items, index);
    });
    webViewContents.ipc.on("fileRead", (event, {filename}) => {
        const data = fs.readFileSync(path.join(getDirName("downloadDirectory"), filename), "utf8");
        event.reply("fileRead-reply", data)
    });
    webViewContents.ipc.on("fileWrite", (event, {filename, data}) => {
        fs.writeFileSync(path.join(getDirName("downloadDirectory"), filename), data);
        event.reply("fileWrite-reply", "")
    });
}
const createWindow = () => {
    const {height, width} = screen.getPrimaryDisplay().workAreaSize;

    const mainWindow = new BrowserWindow({
        x: 0,
        y: 0,
        height,
        width,
        //fullscreen: true,
        webPreferences: {
            webviewTag: true,
            nodeIntegration: true,
            nodeIntegrationInSubFrames: true,
            contextIsolation: false,
            preload: path.join(__dirname, "preload-main.js")
        },
    });

    mainWindow.on("close", app.quit);

    const menu = NMenu(mainWindow, [["App DevTools", () => mainWindow.webContents.openDevTools()]]);
    mainWindow.webContents.on("context-menu", menu.popup);
    mainWindow.webContents.on("did-attach-webview", () => {
        const items = NData.getData();
        const allWebContents = webContents.getAllWebContents().filter(c => c.hostWebContents && c.hostWebContents.id === mainWindow.webContents.id).sort((a, b) => a.id - b.id)
        if (items.length === allWebContents.length) {
            allWebContents.forEach((webViewContents, i) => onWebContents(i, mainWindow, webViewContents, items[i]))
        }
    });

    ipcMain.on("robotClick", (event, element) => {
        mainWindow.webContents.send("leftTop");
        ipcMain.on("leftTop-reply", (e, page) => {
            const workArea = screen.getPrimaryDisplay().workArea;
            robot.moveMouseSmooth(workArea.x + page.x + element.x, workArea.y + page.y + element.y);
            robot.mouseToggle("down");
            setTimeout(() => {
                robot.mouseToggle("up");
                robot.mouseClick();
                event.reply("robotClick-reply")
            }, 100);
        });
    });
    ipcMain.on("robotKeyPress", (event, {key, modifier}) => {
        robot.keyToggle(key, "down", modifier);
        setTimeout(() => {
            robot.keyToggle(key, "up", modifier);
            robot.keyTap(key, modifier);
            event.reply("robotKeyPress-reply")
        }, 100);
    });
    ipcMain.on("robotTypeText", (event, text) => {
        robot.typeString(text);
        event.reply("robotTypeText-reply");
    });

    app.isPackaged
        ? mainWindow.loadFile(path.join(__dirname, "build", "index.html"))
        : mainWindow.loadURL("http://localhost:3000");
}

app.whenReady().then(createWindow);