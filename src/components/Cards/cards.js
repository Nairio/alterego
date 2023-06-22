import Card from "./card";
import Webview from "./webview";
import React, {useEffect, useState} from "react";


export default function Cards({onClick, data: {onData, deleteItem, editItem}}) {
    const [data, setData] = useState([]);

    useEffect(() => onData(setData), []);

    return (
        <div className="cards">
            {data.map(({url, login, password}, index) => (
                <Card key={index} data={{index, url, login, password, editItem, deleteItem}}>
                    <Webview data={{url, login}} onclick={onClick}/>
                </Card>
            ))}
        </div>
    )
}