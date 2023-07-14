const {app, BrowserWindow, webContents, ipcMain, screen, Menu, MenuItem} = require("electron");
const path = require("path");
const fs = require("fs");
const {exec} = require('child_process');
const robot = require("robotjs");
const contextMenu = require("electron-context-menu");

const loadIndex = {};
const getDirName = (...items) => {
    const dirName = path.join(app.getPath("appData"), app.getName(), ...items);
    if (!fs.existsSync(dirName)) {
        fs.mkdirSync(dirName, {recursive: true});
    }
    return dirName;
};
const getFileName = (defVal, ...items) => {
    const filename = items.pop();
    const dirName = getDirName(...items);
    const filepath = path.join(dirName, filename);
    if (!fs.existsSync(filepath)) {
        fs.writeFileSync(filepath, defVal);
    }
    return filepath;
};
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
};
const NMenu = (win, items) => {
    const contextMenu = new Menu();
    items.forEach(([label, click]) => contextMenu.append(new MenuItem({label, click})));
    return {
        popup: (e, {x, y}) => contextMenu.popup(win, x, y)
    }
};
const NItems = (() => {
    const fileName = getFileName("[]", "items.json");

    let onupdate;
    let items;

    const fileUpdated = () => {
        items = JSON.parse(fs.readFileSync(fileName, {encoding: "utf8"}));
        onupdate(items);
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
        items.push(item);
        fs.writeFileSync(fileName, JSON.stringify(items, null, " "));
    }
    const deleteItem = async (item) => {
        const index = items.findIndex(({id}) => id === item.id);
        items.splice(index, 1);
        fs.writeFileSync(fileName, JSON.stringify(items, null, " "));
    }
    const editItem = async ({item}) => {
        const index = items.findIndex(({id}) => id === item.id);
        items[index] = item;
        fs.writeFileSync(fileName, JSON.stringify(items, null, " "));
    }
    const saveItems = async (items) => {
        fs.writeFileSync(fileName, JSON.stringify(items, null, " "));
    }
    const getItems = () => items

    return {setonupdate, addItem, deleteItem, editItem, saveItems, getItems}
})();
const NFields = (() => {
    const fieldsData = {};
    const setFields = (fields, id) => fieldsData[id] = fields;
    const getFields = (id) => fieldsData[id];
    return {setFields, getFields}
})();
const confirm = (mainWindow, text) => {
    return new Promise(resolve => {
        mainWindow.webContents.send("confirm", text);
        ipcMain.on("confirm-reply", (e, result) => {
            resolve(result)
        });
    })
};
const settingsFile = getFileName("{}", "settings", "main.json");
const settings = JSON.parse(fs.readFileSync(settingsFile, "utf8"));

ipcMain.on("getItems", (event) => {
    NItems.setonupdate((items) => event.reply("getItems-reply", {items, settings}));
});
ipcMain.on("addItem", async (event, item) => {
    item.id = Date.now().toString();
    await NItems.addItem(item);
    event.reply("addItem-reply", "ok");
});
ipcMain.on("deleteItem", async (event, item) => {
    await NItems.deleteItem(item);
    event.reply("deleteItem-reply", "ok");
});
ipcMain.on("editItem", async (event, {item}) => {
    await NItems.editItem({item});
    event.reply("editItem-reply", "ok");
});
ipcMain.on("saveItems", async (event, items) => {
    await NItems.saveItems(items);
    event.reply("saveItems-reply", "ok");
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
ipcMain.on("getFields", (event, id) => {
    event.reply("getFields-reply", NFields.getFields(id))
});

const onWebContents = async (index, mainWindow, webViewContents, item) => {
    const {id, scriptfile, proxy, lang, useragent, coords} = item;

    console.log(item.url, scriptfile);

    if (scriptfile) {
        const fileName = getFileName("", "scripts", scriptfile);

        webViewContents.addListener("did-finish-load", () => {
            if (webViewContents.getURL() === "about:blank") return;

            console.log(item.url, webViewContents.getURL(), "did-finish-load");

            loadIndex[id] = loadIndex[id] || 0;
            loadIndex[id]++;
            const script = fs.readFileSync(fileName, "utf8");
            script && webViewContents.executeJavaScript(script);
        });
    }

    contextMenu({
        window: webViewContents,
        showInspectElement: true,
        showCopyImage: true,
        copy: true,
        showLearnSpelling: true,
        showCopyImageAddress: true,
        showSaveImageAs: true,
        showCopyVideoAddress: true,
        showSaveVideo: true,
        showSaveVideoAs: true,
        showCopyLink: true,
        append: () => [
            {
                label: 'Reload',
                click: () => webViewContents.reload()
            },
            {
                label: 'Clear Cache',
                click: async () => {
                    if (await confirm(mainWindow, "Clear Cache")) {
                        await webViewContents.session.clearCache();
                        await webViewContents.session.clearHostResolverCache();
                        await webViewContents.session.clearAuthCache();
                        await webViewContents.session.clearStorageData();
                        await webViewContents.clearHistory();
                        await webViewContents.reload()
                    }
                }
            }
        ],
    });

    webViewContents.session.setProxy({proxyRules: proxy});
    webViewContents.session.setPreloads([path.join(__dirname, "preload-webview.js")]);

    (useragent && !lang) && webViewContents.session.setUserAgent(useragent);
    (useragent && lang) && webViewContents.session.setUserAgent(useragent, lang);

    !webViewContents.debugger.isAttached() && webViewContents.debugger.attach();
    coords && coords[0] && coords[1] && webViewContents.debugger.sendCommand("Emulation.setGeolocationOverride", {
        latitude: +coords[0],
        longitude: +coords[1],
        accuracy: 1
    });


    webViewContents.ipc.on("getLoadIndex", (event) => {
        event.reply("getLoadIndex-reply", loadIndex[id])
    });
    webViewContents.ipc.on("getItemsValue", (event, valueId) => {
        event.reply("getItemsValue-reply", item[valueId])
    });
    webViewContents.ipc.on("setFields", (event, fields) => {
        NFields.setFields(fields, id);
    });
    webViewContents.ipc.on("fileRead", (event, {filename}) => {
        const data = fs.readFileSync(path.join(getDirName("downloadDirectory"), filename), "utf8");
        event.reply("fileRead-reply", data)
    });
    webViewContents.ipc.on("fileWrite", (event, {filename, data}) => {
        fs.writeFileSync(path.join(getDirName("downloadDirectory"), filename), data);
        event.reply("fileWrite-reply", "")
    });
};
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

    contextMenu({
        window: mainWindow,
        showInspectElement: true,
        showCopyImage: true,
        copy: true,
        showLearnSpelling: true,
        showCopyImageAddress: true,
        showSaveImageAs: true,
        showCopyVideoAddress: true,
        showSaveVideo: true,
        showSaveVideoAs: true,
        showCopyLink: true,
        showSaveLinkAs: true,
    });

    const openCardToggle = (e) => {
        settings.cardsOpen = !settings.cardsOpen;
        e.menu.items.map(m => m.visible = !m.visible);
        NItems.setonupdate((items) => mainWindow.webContents.send("getItems-reply", {items, settings}));
        fs.writeFileSync(settingsFile, JSON.stringify(settings, null, " "));
    }

    const template = [
        {
            label: app.getName(),
        },
        {
            label: 'File',
            submenu: [
                {
                    label: 'DevTools',
                    submenu: [
                        {
                            label: 'Open DevTools',
                            accelerator: 'CmdOrCtrl+Shift+J',
                            click: () => mainWindow.webContents.openDevTools()
                        },
                        {
                            label: 'Open DevTools',
                            accelerator: 'CmdOrCtrl+Option+I',
                            click: () => mainWindow.webContents.openDevTools()
                        }
                    ]
                },
                {
                    label: 'Reload',
                    submenu: [
                        {
                            label: 'Reload',
                            accelerator: 'CmdOrCtrl+R',
                            click: () => mainWindow.reload()
                        }
                    ]
                },
                {
                    label: 'Open',
                    click: () => {
                        // Действия при выборе "Open"
                    }
                },
                {
                    label: 'Save',
                    click: () => {
                        // Действия при выборе "Save"
                    }
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Exit',
                    click: () => {
                        app.quit();
                    }
                }
            ]
        },
        {
            label: 'Edit',
            submenu: [
                {
                    label: 'Cut',
                    role: 'cut'
                },
                {
                    label: 'Copy',
                    role: 'copy'
                },
                {
                    label: 'Paste',
                    role: 'paste'
                }
            ]
        },
        {
            label: 'Cards',
            submenu: [
                {
                    label: 'Open',
                    visible: !settings.cardsOpen,
                    click: openCardToggle
                },
                {
                    label: 'Close',
                    visible: settings.cardsOpen,
                    click: openCardToggle
                }
            ]
        }
    ];

    Menu.setApplicationMenu(Menu.buildFromTemplate(template));


    mainWindow.on("close", app.quit);

    const menu = NMenu(mainWindow, [["App DevTools", () => mainWindow.webContents.openDevTools()]]);
    mainWindow.webContents.on("context-menu", menu.popup);
    mainWindow.webContents.on("did-attach-webview", () => {
        const items = NItems.getItems();
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

    ipcMain.on("setSelectedItemId", (event, id) => {
        settings.selectedItemId = id;
        fs.writeFileSync(settingsFile, JSON.stringify(settings, null, " "));
        NItems.setonupdate((items) => event.reply("getItems-reply", {items, settings}));
    });


    app.isPackaged
        ? mainWindow.loadFile(path.join(__dirname, "build", "index.html"))
        : mainWindow.loadURL("http://localhost:3000");
};

app.whenReady().then(createWindow);