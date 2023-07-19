const {app, BrowserWindow, webContents, ipcMain, screen, Menu, MenuItem} = require("electron");
const path = require("path");
const fs = require("fs");
const {exec} = require("child_process");
const robot = require("robotjs");
const contextMenu = require("electron-context-menu");

const webviews = {};
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
    if (process.platform === "win32") {
        openCommand = `explorer "${fileName}"`;
    } else if (process.platform === "darwin") {
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
const NData = (() => {
    const fileName = getFileName("{groups:[], items: [], settings: {}}", "data.json");

    let onupdate;
    let data;

    const fileUpdated = () => {
        data = JSON.parse(fs.readFileSync(fileName, {encoding: "utf8"}));
        onupdate && onupdate(data);
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

    const addEditItem = async (item) => {
        const index = data.items.findIndex(({id}) => id === item.id);
        if (index > -1) {
            data.items[index] = item;
        } else {
            item.id = Date.now().toString();
            data.items.push(item);
        }
        fs.writeFileSync(fileName, JSON.stringify(data, null, " "));
    }
    const deleteItem = async (item) => {
        const index = data.items.findIndex(({id}) => id === item.id);
        data.items.splice(index, 1);
        fs.writeFileSync(fileName, JSON.stringify(data, null, " "));
    }

    const saveGroups = async (groups) => {
        data.groups = groups;
        fs.writeFileSync(fileName, JSON.stringify(data, null, " "));
    }
    const saveItems = async (items) => {
        data.items = items;
        fs.writeFileSync(fileName, JSON.stringify(data, null, " "));
    }

    const getData = () => data

    const panelShowToggle = () => {
        data.settings.panelShow = !data.settings.panelShow;
        fs.writeFileSync(fileName, JSON.stringify(data, null, " "));
    }
    const setSelectedItemId = (id) => {
        data.settings.selectedItemId = id;
        fs.writeFileSync(fileName, JSON.stringify(data, null, " "));
    }

    const setSelectedGroupId = (id) => {
        data.settings.selectedGroupId = id;
        fs.writeFileSync(fileName, JSON.stringify(data, null, " "));
    }

    const addEditGroup = async (group) => {
        const index = data.groups.findIndex(({id}) => id === group.id);
        if (index > -1) {
            data.groups[index] = group;
        } else {
            group.id = Date.now().toString();
            data.groups.push(group);
        }
        fs.writeFileSync(fileName, JSON.stringify(data, null, " "));
    }
    const deleteGroup = async (group) => {
        const index = data.groups.findIndex(({id}) => id === group.id);
        data.groups.splice(index, 1);

        data.items.filter(item => item.groupid === group.id).forEach(item => {
            const index = data.items.findIndex(({id}) => id === item.id);
            data.items.splice(index, 1);
        })


        fs.writeFileSync(fileName, JSON.stringify(data, null, " "));
    }

    const setUserAgent = (groupid, useragent) => {
        const index = data.groups.findIndex(({id}) => id === groupid);
        if (data.groups[index].useragent === useragent) return;
        data.groups[index].useragent = data.groups[index].useragent || useragent;
        fs.writeFileSync(fileName, JSON.stringify(data, null, " "));
    }

    fileUpdated();
    return {
        addEditGroup,
        deleteGroup,
        setonupdate,
        addEditItem,
        deleteItem,
        panelShowToggle,
        setSelectedItemId,
        setSelectedGroupId,
        saveGroups,
        saveItems,
        getData,
        setUserAgent
    }
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

ipcMain.on("getData", (event) => {
    NData.setonupdate((data) => event.reply("getData-reply", data));
});
ipcMain.on("addEditItem", async (event, item) => {
    await NData.addEditItem(item);
    event.reply("addEditItem-reply", "ok");
});
ipcMain.on("addEditGroup", async (event, group) => {
    await NData.addEditGroup(group);
    event.reply("addEditGroup-reply", "ok");
});
ipcMain.on("deleteItem", async (event, item) => {
    await NData.deleteItem(item);
    event.reply("deleteItem-reply", "ok");
});
ipcMain.on("deleteGroup", async (event, group) => {
    await NData.deleteGroup(group);
    event.reply("deleteGroup-reply", "ok");
});
ipcMain.on("clearCache", async (event, group) => {
    for (const id in webviews[group.id]) {
        const webViewContents = webviews[group.id][id];
        await webViewContents.session.clearCache();
        await webViewContents.session.clearHostResolverCache();
        await webViewContents.session.clearAuthCache();
        await webViewContents.session.clearStorageData();
        await webViewContents.clearHistory();
        await webViewContents.reload()
    }
    event.reply("clearCache-reply", "ok");
});
ipcMain.on("saveItems", async (event, items) => {
    await NData.saveItems(items);
    event.reply("saveItems-reply", "ok");
});
ipcMain.on("saveGroups", async (event, groups) => {
    await NData.saveGroups(groups);
    event.reply("saveGroups-reply", "ok");
});
ipcMain.on("saveItems", async (event, items) => {
    await NData.saveItems(items);
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

const onWebContents = async (index, mainWindow, webViewContents, {item, group}) => {
    let {proxy, lang, useragent, coords} = group;
    const {id, scriptfile} = item;
    webviews[group.id] = webviews[group.id] || {};
    webviews[group.id][id] = webViewContents;

    if (scriptfile) {
        const fileName = getFileName("", "scripts", scriptfile);

        webViewContents.addListener("did-finish-load", () => {
            if (webViewContents.getURL() === "about:blank") return;

            loadIndex[id] = loadIndex[id] || 0;
            loadIndex[id]++;
            const script = fs.readFileSync(fileName, "utf8");
            script && webViewContents.executeJavaScript(script);
        });
    }

    contextMenu({
        window: webViewContents,
        showInspectElement: true,
        //showCopyImage: true,
        copy: true,
        //showLearnSpelling: true,
        showCopyImageAddress: true,
        //showSaveImageAs: true,
        showCopyVideoAddress: true,
        //showSaveVideo: true,
        //showSaveVideoAs: true,
        showCopyLink: true,
        append: () => [
            {
                label: "Reload",
                click: () => webViewContents.reload()
            },
            {
                label: "Clear Cache",
                click: async () => {
                    if (await confirm(mainWindow, "Clear Cache")) {
                        await webViewContents.session.clearCache();
                        await webViewContents.session.clearHostResolverCache();
                        await webViewContents.session.clearAuthCache();
                        //await webViewContents.session.clearStorageData();
                        await webViewContents.clearHistory();
                        await webViewContents.reload()
                    }
                }
            }
        ],
    });

    webViewContents.session.setProxy({proxyRules: proxy});
    webViewContents.session.setPreloads([path.join(__dirname, "preload-webview.js")]);

    useragent && lang && webViewContents.session.setUserAgent(useragent, lang);
    useragent && !lang && webViewContents.session.setUserAgent(useragent);

    !webViewContents.debugger.isAttached() && webViewContents.debugger.attach();
    coords = coords || "40.178354870766995,44.513629617002195";
    coords = coords.split(",");
    webViewContents.debugger.sendCommand("Emulation.setGeolocationOverride", {
        latitude: +coords[0],
        longitude: +coords[1],
        accuracy: 1
    });

    webViewContents.ipc.on("getLoadIndex", (event) => {
        event.reply("getLoadIndex-reply", loadIndex[id])
    });
    webViewContents.ipc.on("getItem", (event) => {
        event.reply("getItem-reply", item)
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


    const panelShowToggle = (e) => {
        e.menu.items.map(m => m.visible = !m.visible);
        NData.panelShowToggle();
    }

    const template = [
        {
            label: app.getName(),
        },
        {
            label: "File",
            submenu: [
                {
                    label: "DevTools",
                    submenu: [
                        {
                            label: "Open DevTools",
                            accelerator: "CmdOrCtrl+Shift+J",
                            click: () => mainWindow.webContents.openDevTools()
                        },
                        {
                            label: "Open DevTools",
                            accelerator: "CmdOrCtrl+Option+I",
                            click: () => mainWindow.webContents.openDevTools()
                        }
                    ]
                },
                {
                    label: "Reload",
                    submenu: [
                        {
                            label: "Reload",
                            accelerator: "CmdOrCtrl+R",
                            click: () => mainWindow.reload()
                        }
                    ]
                },
                {
                    label: "Open",
                    click: () => {
                        // Действия при выборе "Open"
                    }
                },
                {
                    label: "Save",
                    click: () => {
                        // Действия при выборе "Save"
                    }
                },
                {
                    type: "separator"
                },
                {
                    label: "Exit",
                    click: () => {
                        app.quit();
                    }
                }
            ]
        },
        {
            label: "Edit",
            submenu: [
                {
                    label: "Cut",
                    role: "cut"
                },
                {
                    label: "Copy",
                    role: "copy"
                },
                {
                    label: "Paste",
                    role: "paste"
                }
            ]
        },
        {
            label: "Panel",
            submenu: [
                {
                    label: "Show",
                    visible: !NData.getData().settings.panelShow,
                    click: panelShowToggle
                },
                {
                    label: "Hide",
                    visible: NData.getData().settings.panelShow,
                    click: panelShowToggle
                }
            ]
        }
    ];

    Menu.setApplicationMenu(Menu.buildFromTemplate(template));


    mainWindow.on("close", app.quit);


    const menu = NMenu(mainWindow, [["App DevTools", () => mainWindow.webContents.openDevTools()]]);
    mainWindow.webContents.on("context-menu", menu.popup);
    mainWindow.webContents.on("did-attach-webview", () => {
        const {items, groups} = NData.getData();
        const nItems = [];
        groups.forEach(group => items.filter(item => item.groupid === group.id).forEach(item => nItems.push({
            item,
            group
        })));

        const allWebContents = webContents.getAllWebContents().filter(c => c.hostWebContents && c.hostWebContents.id === mainWindow.webContents.id).sort((a, b) => a.id - b.id)
        if (items.length === allWebContents.length) {
            allWebContents.forEach((webViewContents, i) => onWebContents(i, mainWindow, webViewContents, nItems[i]))
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
        NData.setSelectedItemId(id)
    });
    ipcMain.on("setSelectedGroupId", (event, id) => {
        NData.setSelectedGroupId(id)
    });


    app.isPackaged
        ? mainWindow.loadFile(path.join(__dirname, "build", "index.html"))
        : mainWindow.loadURL("http://localhost:3000");
};

app.whenReady().then(createWindow);