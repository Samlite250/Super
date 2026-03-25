const multer = require('multer');
const path = require('path');

const fs = require('fs');

const isVercel = process.env.VERCEL === '1' || process.env.VERCEL;

const storage = isVercel ? multer.memoryStorage() : multer.diskStorage({
  destination: (req, file, cb) => {
    const dest = path.join(__dirname, '../../uploads');
    
    // Ensure the directory exists
    if (!fs.existsSync(dest)) {
      try {
        fs.mkdirSync(dest, { recursive: true });
      } catch (err) {
        console.error('Error creating upload directory', err);
      }
    }
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});


const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|pdf|webp|avif/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype);
  if (ext || mime) cb(null, true);
  else cb(new Error('Only images (JPEG, PNG, WEBP) or PDF files are allowed'));
};


module.exports = multer({ storage, fileFilter });
