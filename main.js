const {app, BrowserWindow, webContents, ipcMain, screen, Menu, MenuItem} = require("electron");

const path = require("path");
const fs = require("fs");
const NData = (() => {
    const fileName = path.join(app.getPath("appData"), app.getName(), "data.json");

    if (!fs.existsSync(fileName)) {
        fs.mkdirSync(path.dirname(fileName), {recursive: true});
        fs.writeFileSync(fileName, "[]");
    }

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
})();
const NMenu = (win, items) => {
    const contextMenu = new Menu();
    items.forEach(([label, click]) => contextMenu.append(new MenuItem({label, click})));
    return {
        popup: (e, {x, y}) => contextMenu.popup(win, x, y)
    }
};
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
const downloadDirectory = path.join(app.getPath("appData"), app.getName(), "downloadDirectory");
if (!fs.existsSync(downloadDirectory)) {
    fs.mkdirSync(downloadDirectory, {recursive: true});
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

    const webContentsSettings = async () => {
        const items = NData.getData();
        const allWebContents = webContents.getAllWebContents().filter(c => c.hostWebContents && c.hostWebContents.id === mainWindow.webContents.id).reverse();
        if (items.length !== allWebContents.length) return;

        allWebContents.forEach((webViewContents, i) => {
            const {scriptfile, proxy, lang, useragent, lat, lng} = items[i];

            const menuItems = [
                ["Reload", () => webViewContents.reload()],
                ["WebView DevTools", () => webViewContents.openDevTools()],
                ["Clear Cache", () => webViewContents.session.clearCache()],
            ];

            if (scriptfile) {
                const fileName = path.join(app.getPath("appData"), app.getName(), "scripts", scriptfile);
                if (!fs.existsSync(fileName)) {
                    fs.mkdirSync(path.dirname(fileName), {recursive: true});
                    fs.writeFileSync(fileName, "");
                }
                menuItems.push(["Open Script File", () => shellExec(fileName)]);
                menuItems.push(["Open Download Directory", () => shellExec(downloadDirectory)]);

                webViewContents.addListener("did-finish-load", () => {
                    webViewContents.executeJavaScript(fs.readFileSync(fileName, "utf8"))
                });
            }

            webViewContents.addListener("context-menu", NMenu(mainWindow, menuItems).popup);
            webViewContents.session.setProxy({proxyRules: proxy});
            webViewContents.session.setPreloads([path.join(__dirname, "preload.js"), path.join(__dirname, "scripts", "1.js")]);
            webViewContents.debugger.attach();
            webViewContents.debugger.sendCommand("Emulation.setUserAgentOverride", {
                acceptLanguage: lang,
                userAgent: useragent,
                platform: "EVM"
            });
            webViewContents.debugger.sendCommand("Emulation.setGeolocationOverride", {
                latitude: +lat,
                longitude: +lng,
                accuracy: 1
            });
        })

    }

    const menu = NMenu(mainWindow, [["App DevTools", () => mainWindow.webContents.openDevTools()]]);
    mainWindow.webContents.on("context-menu", menu.popup);
    mainWindow.webContents.on("did-attach-webview", webContentsSettings);

    app.isPackaged
        ? mainWindow.loadFile(path.join(__dirname, "build", "index.html"))
        : mainWindow.loadURL("http://localhost:3000");
};

ipcMain.on("fileWrite", (e, {filename, data}) => {
    fs.writeFileSync(path.join(downloadDirectory, filename), data);
    e.reply("fileWrite-reply", "");
});

ipcMain.on("fileRead", (e, {filename}) => {
    const data = fs.readFileSync(path.join(downloadDirectory, filename));
    e.reply("fileRead-reply", data)
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

app.whenReady().then(createWindow);