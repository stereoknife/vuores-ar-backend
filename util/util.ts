export function purge (o: { [x: string]: any; }) : void {
    Object.keys(o).forEach(key => {
        if (!o[key]) delete o[key]
    })
}