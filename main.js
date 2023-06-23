const {app, BrowserWindow, ipcMain, screen, Menu, MenuItem} = require("electron");

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
            contextIsolation: false,
            preload: path.join(__dirname, "main-preload.js")
        },
    });

    mainWindow.on("close", app.quit);

    const menu = NMenu(mainWindow, [["App DevTools", () => mainWindow.webContents.openDevTools()]]);
    mainWindow.webContents.on("context-menu", menu.popup);

    mainWindow.webContents.on("did-attach-webview", (event, webview) => {
        const menu = NMenu(mainWindow, [["WebView DevTools", () => webview.openDevTools()]]);
        webview.addListener("context-menu", menu.popup);
        webview.addListener("did-finish-load",  () => {
             webview.executeJavaScript(`
                console.log("Hello from main process");
                window.sendToMainProcess('my-channel', "Main Process JS > Main Process");
                window.sendToPreload("Main Process JS > Preload");
            `);
        });

    });

    ipcMain.on("my-channel", (event, data) => {
        console.log(data);
    });

    app.isPackaged
        ? mainWindow.loadFile(path.join(__dirname, "build", "index.html"))
        : mainWindow.loadURL("http://localhost:3000");
};

ipcMain.setMaxListeners(1000);
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