const crypto = require('crypto');
module.exports = {
    md5: (source) => {
        let md5 = crypto.createHash('md5');
        return md5.update(source).digest('hex');
    }
}