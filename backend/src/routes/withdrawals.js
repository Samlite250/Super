const express = require('express');
const router = express.Router();
const withdrawalController = require('../controllers/withdrawalController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

router.post('/', authenticate, withdrawalController.request);

// admin
router.get('/', authenticate, authorizeAdmin, withdrawalController.list);
router.get('/export', authenticate, authorizeAdmin, withdrawalController.exportWithdrawals);
router.post('/:id/approve', authenticate, authorizeAdmin, withdrawalController.approve);
router.post('/:id/reject', authenticate, authorizeAdmin, withdrawalController.reject);
router.delete('/:id', authenticate, authorizeAdmin, withdrawalController.deleteWithdrawal);


module.exports = router;