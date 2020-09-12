const os = require('os');
const ifaces = os.networkInterfaces();

module.exports = {
    getIPv4: () => {
        const platform = os.platform();
        let networkName = 'eth0';
        if (platform === 'darwin') {
            networkName = 'en0'
        }
        let ipList = ifaces[networkName].filter(o => o.family === 'IPv4');
        let ip = ipList[0] || {}
        return ip.address || ''
    },
    getIPv6: () => {
        const platform = os.platform();
        let networkName = 'eth0';
        if (platform === 'darwin') {
            networkName = 'en0'
        }
        let ipList = ifaces[networkName].filter(o => o.family === 'IPv6');
        let ip = ipList[0] || {}
        return ip.address || ''
    }

}