const fs = require('fs');
const path = require('path');

const avatarsDir = path.join(__dirname, '../uploads/avatars');

if (!fs.existsSync(avatarsDir)) {
  fs.mkdirSync(avatarsDir, { recursive: true });
}

