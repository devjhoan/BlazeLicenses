module.exports = () => {
    const strings = "ABCDEFGHIJKLMNIOPQRSTUVWXYZ0123456789";
    let license = "";
    for (let i = 0; i < 25; i++) {
        license += strings[Math.floor(Math.random() * strings.length)];
    }
    license = license.replace(/([a-zA-Z0-9]{5})/g, "$1-").slice(0, -1);
    return license;
}