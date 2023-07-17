import React, {useEffect, useRef} from "react";
import SortableJS from "sortablejs";

let NSort = {};

export function Sortable({id, onSort, className, children}) {
    const listRef = useRef(null);

    useEffect(() => {
        NSort[id] && NSort[id].destroy();
        NSort[id] = new SortableJS(listRef.current, {
            animation: 500,
            ghostClass: "sortable-background",
            dataIdAttr: "id",
            dragClass: "sortable-drag",
            onSort: () => onSort(NSort[id].toArray())
        }, []);

    });

    return (
        <div className={className} ref={listRef}>
            {children}
        </div>
    )
}