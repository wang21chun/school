module.exports = {
    isNull: (obj) => {
        return undefined === obj || Object.keys(obj).length <= 0;
    }
}