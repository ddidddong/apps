const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'imgs');
let renamed = 0;
fs.readdirSync(dir).forEach(file => {
    const nfc = file.normalize('NFC');
    if (file !== nfc) {
        fs.renameSync(path.join(dir, file), path.join(dir, nfc));
        renamed++;
    }
});
console.log(`Renamed ${renamed} files to NFC.`);
