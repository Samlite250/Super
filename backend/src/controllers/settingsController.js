const { Setting, ExchangeRate } = require('../models');

exports.getAll = async (req, res) => {
  const settings = await Setting.findAll();
  const map = {};
  settings.forEach(s => {
    try {
      if (s.value && (s.value.startsWith('{') || s.value.startsWith('['))) {
        map[s.key] = JSON.parse(s.value);
      } else {
        map[s.key] = s.value;
      }
    } catch (e) {
      map[s.key] = s.value;
    }
  });
  res.json(map);
};

exports.getPublicSettings = async (req, res) => {
  const publicKeys = ['auto_deposit_enabled', 'supportEmail'];
  const settings = await Setting.findAll({ where: { key: publicKeys } });
  const map = {};
  settings.forEach(s => {
    map[s.key] = s.value;
  });
  res.json(map);
};

exports.update = async (req, res) => {
  const { key, value } = req.body;
  let setting = await Setting.findByPk(key);
  if (setting) {
    setting.value = value;
    await setting.save();
  } else {
    setting = await Setting.create({ key, value });
  }
  res.json(setting);
};

exports.getRates = async (req, res) => {
  const rates = await ExchangeRate.findAll();
  res.json(rates);
};

exports.setRate = async (req, res) => {
  const { currency, rateToFBu } = req.body;
  let rate = await ExchangeRate.findOne({ where: { currency } });
  if (rate) {
    rate.rateToFBu = rateToFBu;
    await rate.save();
  } else {
    rate = await ExchangeRate.create({ currency, rateToFBu });
  }
  res.json(rate);
};

// Payment options stored as JSON under key 'paymentOptions'
exports.getPaymentOptions = async (req, res) => {
  try {
    const setting = await Setting.findByPk('paymentOptions');
    const options = setting && setting.value ? JSON.parse(setting.value) : [];
    res.json(options);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load payment options' });
  }
};

exports.setPaymentOptions = async (req, res) => {
  try {
    const { options } = req.body; // expect array
    const value = JSON.stringify(options || []);
    let setting = await Setting.findByPk('paymentOptions');
    if (setting) {
      setting.value = value;
      await setting.save();
    } else {
      setting = await Setting.create({ key: 'paymentOptions', value });
    }
    res.json({ success: true, options: JSON.parse(setting.value) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save payment options' });
  }
};

// single procedure save for deposits admin UI
exports.setPaymentProcedure = async (req, res) => {
  try {
    const proc = req.body; // expect object with country, method, instructions, accountDetails
    let setting = await Setting.findByPk('paymentProcedures');
    let procedures = {};
    if (setting && setting.value) {
      try { procedures = JSON.parse(setting.value); } catch (e) { procedures = {}; }
    }
    if (!proc || !proc.country) return res.status(400).json({ error: 'Invalid procedure' });
    procedures[proc.country] = proc;
    const value = JSON.stringify(procedures);
    if (setting) {
      setting.value = value;
      await setting.save();
    } else {
      setting = await Setting.create({ key: 'paymentProcedures', value });
    }
    res.json({ success: true, procedures });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save procedure' });
  }
};

exports.deletePaymentProcedure = async (req, res) => {
  try {
    const { country } = req.body;
    let setting = await Setting.findByPk('paymentProcedures');
    if (!setting || !setting.value) return res.json({ success: true });
    
    let procedures = JSON.parse(setting.value);
    delete procedures[country];
    
    setting.value = JSON.stringify(procedures);
    await setting.save();
    
    res.json({ success: true, procedures });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete procedure' });
  }
};

exports.uploadPaymentLogo = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const url = req.file.buffer 
      ? `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}` 
      : `/uploads/${req.file.filename}`;
    res.json({ url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Upload failed' });
  }
};

// Public getter for payment procedures (country -> procedure)
exports.getPaymentProcedures = async (req, res) => {
  try {
    const setting = await Setting.findByPk('paymentProcedures');
    const procedures = setting && setting.value ? JSON.parse(setting.value) : {};
    res.json(procedures);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load payment procedures' });
  }
};

// upload logo for a specific payment procedure (admin)
exports.uploadPaymentProcedureLogo = async (req, res) => {
  try {
    const country = req.body.country;
    if (!country) return res.status(400).json({ error: 'Country is required' });
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const url = req.file.buffer 
      ? `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}` 
      : `/uploads/${req.file.filename}`;

    // load existing procedures
    let setting = await Setting.findByPk('paymentProcedures');
    let procedures = {};
    if (setting && setting.value) {
      try { procedures = JSON.parse(setting.value); } catch (e) { procedures = {}; }
    }

    procedures[country] = procedures[country] || {};
    procedures[country].logo = url;

    const value = JSON.stringify(procedures);
    if (setting) {
      setting.value = value;
      await setting.save();
    } else {
      setting = await Setting.create({ key: 'paymentProcedures', value });
    }

    res.json({ url, procedures });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to upload procedure logo' });
  }
};

// Social links: WhatsApp & Telegram
exports.getSocialLinks = async (req, res) => {
  try {
    const setting = await Setting.findByPk('socialLinks');
    const links = setting && setting.value ? JSON.parse(setting.value) : { whatsapp: '', telegram: '' };
    res.json(links);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load social links' });
  }
};

exports.setSocialLinks = async (req, res) => {
  try {
    const { whatsapp, telegram } = req.body;
    const value = JSON.stringify({ whatsapp, telegram });
    let setting = await Setting.findByPk('socialLinks');
    if (setting) {
      setting.value = value;
      await setting.save();
    } else {
      setting = await Setting.create({ key: 'socialLinks', value });
    }
    res.json({ success: true, links: JSON.parse(setting.value) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save social links' });
  }
};

// ─── Crypto Wallets ───────────────────────────────────────────────────────────
exports.getCryptoWallets = async (req, res) => {
  try {
    const setting = await Setting.findByPk('cryptoWallets');
    const wallets = setting && setting.value ? JSON.parse(setting.value) : {};
    res.json(wallets);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load crypto wallets' });
  }
};

exports.setCryptoWallets = async (req, res) => {
  try {
    const wallets = req.body; // e.g. { trc20: 'TXXX...', enabled: true }
    const value = JSON.stringify(wallets);
    let setting = await Setting.findByPk('cryptoWallets');
    if (setting) {
      setting.value = value;
      await setting.save();
    } else {
      setting = await Setting.create({ key: 'cryptoWallets', value });
    }
    res.json({ success: true, wallets: JSON.parse(setting.value) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save crypto wallets' });
  }
};

// ─── Seed Default Settings ───────────────────────────────────────────────────
exports.seedDefaults = async (req, res) => {
  try {
    const defaults = [
      { key: 'referral_reward_percentage', value: '10' },
      { key: 'referral_high_capital_threshold', value: '500000' },
      { key: 'referral_high_capital_bonus', value: '5' },
      { key: 'referral_bonus', value: '0' },
      { key: 'referral_ladder_Burundi', value: '500000,800000,1100000,1500000,2000000' },
      { key: 'referral_ladder_Rwanda', value: '350000,600000,900000,1200000,1500000' },
      { key: 'referral_ladder_Uganda', value: '500000,800000,1100000,1500000,2000000' },
      { key: 'referral_ladder_Kenya', value: '50000,80000,110000,150000,200000' },
      { key: 'referral_ladder_Global', value: '500000,800000,1100000,1500000,2000000' },
    ];
    const results = [];
    for (const d of defaults) {
      const existing = await Setting.findByPk(d.key);
      if (!existing) {
        await Setting.create(d);
        results.push({ key: d.key, status: 'created' });
      } else {
        results.push({ key: d.key, status: 'already exists', current: existing.value });
      }
    }
    res.json({ message: 'Settings defaults seeded', results });
  } catch (err) {
    console.error('[SETTINGS] seedDefaults error:', err.message);
    res.status(500).json({ message: 'Seed failed: ' + err.message });
  }
};

