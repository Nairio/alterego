const {ipcRenderer} = require("electron");

window.addEventListener("DOMContentLoaded", () => {
    ipcRenderer.send('html', document.body.innerHTML);
    ipcRenderer.on('html-reply', (event, data) => {
        console.log(data);
    });
})



