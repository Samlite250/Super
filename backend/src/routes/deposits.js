const express = require('express');
const router = express.Router();
const depositController = require('../controllers/depositController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/', authenticate, depositController.request);
router.post('/:id/proof', authenticate, upload.single('proof'), depositController.uploadProof);

// admin
router.get('/', authenticate, authorizeAdmin, depositController.list);
router.post('/:id/approve', authenticate, authorizeAdmin, depositController.approve);
router.post('/:id/reject', authenticate, authorizeAdmin, depositController.reject);

module.exports = router;