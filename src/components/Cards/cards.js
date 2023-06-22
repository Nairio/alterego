import Card from "./card";
import Webview from "./webview";
import React, {useEffect, useState} from "react";


export default function Cards({onClick, data: {onData, deleteItem, editItem}}) {
    const [data, setData] = useState([]);

    useEffect(() => onData(setData), []);

    return (
        <div className="cards">
            {data.map((item, index) => (
                <Card key={index} index={index} editItem={editItem} deleteItem={deleteItem} item={item}>
                    <Webview item={item} onclick={onClick}/>
                </Card>
            ))}
        </div>
    )
}