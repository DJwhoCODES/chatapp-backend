const express = require('express');
const { register, login, getUsers } = require('../controllers/userControllers');
const multer = require('multer');
const authMiddleware = require('../middlewares/authMiddleware');

// Configure Multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/') // Files will be saved in the 'uploads' directory
    },
    filename: function (req, file, cb) {
        // Create unique filename with timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop())
    }
})

// Initialize Multer with configuration
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB file size limit
    },
    fileFilter: (req, file, cb) => {
        // Accept images only
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
            return cb(new Error('Only image files are allowed!'), false)
        }
        cb(null, true)
    }
})

const router = express.Router();

router.post('/login', login);
router.post('/sign-up', upload.single('pic'), register);
router.get('/get-users', authMiddleware, getUsers);

module.exports = router;