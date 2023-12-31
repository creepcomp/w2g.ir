export default function stringToColor(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    const hex = ((hash & 0x00ffffff) << 0).toString(16);
    return "#" + "00000".substring(0, 6 - hex.length) + hex;
}
