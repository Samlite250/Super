const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/verify-admin-otp', authController.verifyAdminOtp);
router.post('/resend-admin-otp', authController.resendAdminOtp);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.get('/verify/:token', authController.verifyEmail);

module.exports = router;