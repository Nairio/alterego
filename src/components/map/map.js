import React from "react";

window.mapInfo = window.mapInfo || {};

const apikey = "6c9d5c18-b6af-4b39-8a71-d9b85ae9d119";

export const onMapData = (func) => window.mapInfo.sendData = func;
export const openMap = (coords = "40.178354870766995,44.513629617002195") => {
    coords = coords.split(",");
    const {mapInfo} = window;

    if (mapInfo.isReady) {
        mapInfo.mapContainer.style.display = "block";
        mapInfo.setCoords(coords);
    }

    if (!mapInfo.isMounted) {
        const onload = () => {
            const {ymaps} = window;
            ymaps.ready(() => {
                const map = new ymaps.Map("map", {center: coords, zoom: 8, controls: []});
                const placemark = new ymaps.GeoObject({
                    geometry: {
                        type: "Point",
                        coordinates: coords
                    }
                }, {draggable: true});
                placemark.events.add("drag", () => mapInfo.sendData(placemark.geometry.getCoordinates().join(",")));
                map.geoObjects.add(placemark);
                mapInfo.setCoords = (coords) => {
                    placemark.geometry.setCoordinates(coords);
                    map.setCenter(coords);
                }
                mapInfo.isReady = true;
            });
        }

        const script = document.createElement("script");
        script.onload = onload;
        script.src = `https://api-maps.yandex.ru/2.1/?apikey=${apikey}&lang=ru_RU`;
        document.head.appendChild(script);

        mapInfo.mapContainer = document.createElement("div");
        mapInfo.mapContainer.setAttribute("style", `
            z-index:10000; 
            position: absolute;
            top: 0;
            left: 0;
            padding: 20px;
            height: calc(100vh - 40px);
            width: calc(100% - 40px);
        `);

        document.body.appendChild(mapInfo.mapContainer);

        const map = document.createElement("div");
        map.id = "map";
        map.setAttribute("style", "height: 100%; width: 100%");
        mapInfo.mapContainer.appendChild(map);

        const button = document.createElement("button");
        button.innerText = "X";
        button.onclick = () => mapInfo.mapContainer.style.display = "none";
        button.setAttribute("style", "position: absolute;top: 22px;right: 22px;");
        mapInfo.mapContainer.appendChild(button);

        mapInfo.isMounted = true;
    }
}


