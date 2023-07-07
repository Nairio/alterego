const {app, BrowserWindow, webContents, ipcMain, screen, Menu, MenuItem} = require("electron");
const path = require("path");
const fs = require("fs");

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
    const {exec} = require('child_process');
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
    const addDataItem = (item, index)=>{
        dataItems[index] = dataItems[index] || [];
        dataItems[index].push(item);
    }

    return {addDataItem, getDataItems: (index) => dataItems[index]}
})()

ipcMain.on("getDataValue", (event, {id, index}) => {
    event.reply("getDataValue-reply", NData.getData()[index][id])
});
ipcMain.on("addDataItem", (event, {item, index}) => {
    NdataItems.addDataItem(item, index);
});
ipcMain.on("getDataItems", (event, index) => {
    event.reply("getDataItems-reply", NdataItems.getDataItems(index));
});
ipcMain.on("fileRead", (event, {filename}) => {
    const data = fs.readFileSync(path.join(getDirName("downloadDirectory"), filename), "utf8");
    event.reply("fileRead-reply", data)
});
ipcMain.on("fileWrite", (event, {filename, data}) => {
    fs.writeFileSync(path.join(getDirName("downloadDirectory"), filename), data);
    event.reply("fileWrite-reply", "")
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

const onWebContents = (index, mainWindow, webViewContents, {scriptfile, proxy, lang, useragent, lat, lng}) => {
    const menuItems = [
        ["Reload", () => webViewContents.reload()],
        ["WebView DevTools", () => webViewContents.openDevTools()],
        ["Clear Cache", () => webViewContents.session.clearCache()],
    ];

    webViewContents.executeJavaScript(`window.dataIndex = ${index};`);

    if (scriptfile) {
        const fileName = getFileName("", "scripts", scriptfile);
        menuItems.push(["Open Script File", () => shellExec(fileName)]);
        menuItems.push(["Open Download Directory", () => shellExec(getDirName("downloadDirectory"))]);

        webViewContents.addListener("did-finish-load", () => {
            const script = fs.readFileSync(fileName, "utf8");
            script && webViewContents.executeJavaScript(script);
        });
    }

    webViewContents.addListener("context-menu", NMenu(mainWindow, menuItems).popup);
    webViewContents.session.setProxy({proxyRules: proxy});
    webViewContents.session.setPreloads([path.join(__dirname, "preload.js")]);
    webViewContents.debugger.attach();
    (useragent || lang) && webViewContents.debugger.sendCommand("Emulation.setUserAgentOverride", {
        acceptLanguage: lang,
        userAgent: useragent,
        platform: "EVM"
    });
    webViewContents.debugger.sendCommand("Emulation.setGeolocationOverride", {
        latitude: +lat,
        longitude: +lng,
        accuracy: 1
    });
}
const createWindow = () => {
    const {height, width} = screen.getPrimaryDisplay().workAreaSize;

    const mainWindow = new BrowserWindow({
        x: 0,
        y: 0,
        height,
        width,
        webPreferences: {
            webviewTag: true,
            nodeIntegration: true,
            nodeIntegrationInSubFrames: true,
            contextIsolation: false,
            preload: path.join(__dirname, "main-preload.js")
        },
    });

    mainWindow.on("close", app.quit);
    mainWindow.on("hide", app.quit);

    const menu = NMenu(mainWindow, [["App DevTools", () => mainWindow.webContents.openDevTools()]]);
    mainWindow.webContents.on("context-menu", menu.popup);
    mainWindow.webContents.on("did-attach-webview", () => {
        const items = NData.getData();
        const allWebContents = webContents.getAllWebContents().filter(c => c.hostWebContents && c.hostWebContents.id === mainWindow.webContents.id).sort((a, b) => a.id - b.id)
        if (items.length === allWebContents.length) {
            allWebContents.forEach((webViewContents, i) => onWebContents(i, mainWindow, webViewContents, items[i]))
        }
    });

    app.isPackaged
        ? mainWindow.loadFile(path.join(__dirname, "build", "index.html"))
        : mainWindow.loadURL("http://localhost:3000");
}

app.whenReady().then(createWindow);