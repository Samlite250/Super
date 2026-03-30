const express = require('express');
const router = express.Router();
const invCtrl = require('../controllers/investmentController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

router.post('/', authenticate, invCtrl.invest);
router.get('/me', authenticate, invCtrl.listUser);
// admin
router.get('/', authenticate, authorizeAdmin, invCtrl.listAll);
router.delete('/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { Investment } = require('../models');
    const inv = await Investment.findByPk(req.params.id);
    if (!inv) return res.status(404).json({ message: 'Investment not found' });
    inv.status = 'terminated';
    await inv.save();
    res.json({ message: 'Investment terminated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;