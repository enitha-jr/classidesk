const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../public/uploads'));
  },
  filename: function (req, file, cb) {
    const tempFilename = Date.now() + '-' + file.originalname;
    req.tempFilename = tempFilename; // optional metadata
    cb(null, tempFilename);
  }
});

const upload = multer({ storage });
module.exports = upload;
