const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', authenticate, authorizeAdmin, settingsController.getAll);
router.get('/public', authenticate, settingsController.getPublicSettings);
router.post('/', authenticate, authorizeAdmin, settingsController.update);
router.get('/rates', authenticate, authorizeAdmin, settingsController.getRates);
router.post('/rates', authenticate, authorizeAdmin, settingsController.setRate);
// payment options: public read, admin update
router.get('/payment-options', settingsController.getPaymentOptions);
// public getter for country-specific procedures
router.get('/payment-procedures', settingsController.getPaymentProcedures);
router.post('/payment-procedures/upload', authenticate, authorizeAdmin, upload.single('file'), settingsController.uploadPaymentProcedureLogo);
router.post('/payment-options', authenticate, authorizeAdmin, settingsController.setPaymentOptions);
router.post('/payment-options/upload', authenticate, authorizeAdmin, upload.single('logo'), settingsController.uploadPaymentLogo);
// single procedure endpoint for admin deposits UI
// social links
router.get('/social-links', settingsController.getSocialLinks);
router.post('/social-links', authenticate, authorizeAdmin, settingsController.setSocialLinks);

module.exports = router;