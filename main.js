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

    const addItem = async ({url, login, password}) => {
        data.push({url, login, password});
        fs.writeFileSync(fileName, JSON.stringify(data, null, " "));
    }

    const deleteItem = async (i) => {
        data.splice(i, 1);
        fs.writeFileSync(fileName, JSON.stringify(data, null, " "));
    }

    const editItem = async ({index, url, login, password}) => {
        data[index] = {url, login, password};
        fs.writeFileSync(fileName, JSON.stringify(data, null, " "));
    }

    return {setonupdate, addItem, deleteItem, editItem, getData: () => data}
})();

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

    const contextMenu = new Menu();
    const menuItem = new MenuItem({label: "DevTools"});
    menuItem.click = () => mainWindow.webContents.openDevTools();
    contextMenu.append(menuItem);

    mainWindow.webContents.on("context-menu", (event, params) => {
        contextMenu.popup(mainWindow, params.x, params.y);
    });

    app.isPackaged
        ? mainWindow.loadFile(path.join(__dirname, "build", "index.html"))
        : mainWindow.loadURL("http://localhost:3000");
};

ipcMain.setMaxListeners(1000);
ipcMain.on("getData", (event) => {
    NData.setonupdate((data) => event.reply("getData-reply", data));
});
ipcMain.on("addItem", async (event, data) => {
    await NData.addItem(data);
    event.reply("addItem-reply", "ok");
});
ipcMain.on("deleteItem", async (event, index) => {
    await NData.deleteItem(index);
    event.reply("deleteItem-reply", "ok");
});
ipcMain.on("editItem", async (event, data) => {
    await NData.editItem(data);
    event.reply("editItem-reply", "ok");
});

app.whenReady().then(createWindow);




