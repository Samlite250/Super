const express = require('express');
const router = express.Router();
const machineController = require('../controllers/machineController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

// route lists machines; conversion logic inside controller will check token if present
router.get('/', machineController.list);
router.post('/', authenticate, authorizeAdmin, upload.single('image'), machineController.create);
router.put('/:id', authenticate, authorizeAdmin, upload.single('image'), machineController.update);
router.delete('/:id', authenticate, authorizeAdmin, machineController.delete);

// Admin-only: seed default plans for all countries
router.post('/seed-countries', authenticate, authorizeAdmin, machineController.seedCountries);

module.exports = router;