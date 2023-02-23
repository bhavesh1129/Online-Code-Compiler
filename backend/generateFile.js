const path = require('path');
const fs = require('fs');
const { v4: uuid } = require('uuid');

const dirCodes = path.join(__dirname, 'code');

if (!fs.existsSync(dirCodes)) {
    fs.mkdirSync(dirCodes, { recursive: true });
}

const generateFile = async (language, code) => {
    const jobId = uuid();
    const fileName = `${jobId}.${language}`;
    const filePath = path.join(dirCodes, fileName);
    await fs.writeFileSync(filePath, code);
    return filePath;
};

module.exports = {
    generateFile
};