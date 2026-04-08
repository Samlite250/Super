const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', authenticate, settingsController.getAll);               // all logged-in users can read settings (for referral ladder display)
router.get('/public', authenticate, settingsController.getPublicSettings);
router.post('/', authenticate, authorizeAdmin, settingsController.update);
router.put('/', authenticate, authorizeAdmin, settingsController.update); // alias for AdminSettings UI
router.get('/rates', authenticate, authorizeAdmin, settingsController.getRates);
router.post('/rates', authenticate, authorizeAdmin, settingsController.setRate);
// payment options: public read, admin update
router.get('/payment-options', settingsController.getPaymentOptions);
// public getter for country-specific procedures
router.get('/payment-procedures', settingsController.getPaymentProcedures);
router.post('/payment-procedures/upload', authenticate, authorizeAdmin, upload.single('file'), settingsController.uploadPaymentProcedureLogo);
router.post('/payment-options', authenticate, authorizeAdmin, settingsController.setPaymentOptions);
router.post('/payment-options/upload', authenticate, authorizeAdmin, upload.single('logo'), settingsController.uploadPaymentLogo);
// social links
router.get('/social-links', settingsController.getSocialLinks);
router.post('/social-links', authenticate, authorizeAdmin, settingsController.setSocialLinks);
// crypto wallets
router.get('/crypto-wallets', settingsController.getCryptoWallets);
router.post('/crypto-wallets', authenticate, authorizeAdmin, settingsController.setCryptoWallets);
// seed default settings (admin only) - call once to bootstrap referral ladder keys in DB
router.post('/seed-defaults', authenticate, authorizeAdmin, settingsController.seedDefaults);

module.exports = router;
