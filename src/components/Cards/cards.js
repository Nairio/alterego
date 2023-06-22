import Card from "./card";
import Webview from "./webview";
import React, {useEffect, useState} from "react";


export default function Cards({onClick, data: {onData, deleteItem, editItem}}) {
    const [data, setData] = useState([]);

    useEffect(() => onData(setData), []);

    return (
        <div className="cards">
            {data.map((item, index) => (
                <Card key={index} index={index} item={item} editItem={editItem} deleteItem={deleteItem} >
                    <Webview item={item} onclick={onClick}/>
                </Card>
            ))}
        </div>
    )
}