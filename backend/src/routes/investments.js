const express = require('express');
const router = express.Router();
const invCtrl = require('../controllers/investmentController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

router.post('/', authenticate, invCtrl.invest);
router.get('/me', authenticate, invCtrl.listUser);
// admin
router.get('/', authenticate, authorizeAdmin, invCtrl.listAll);

module.exports = router;