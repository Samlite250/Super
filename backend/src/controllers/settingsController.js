const { Setting, ExchangeRate } = require('../models');

exports.getAll = async (req, res) => {
  const settings = await Setting.findAll();
  // return as key => parsed value map for easier frontend consumption
  const map = {};
  settings.forEach(s => {
    try {
      // only parse if it looks like JSON array or object
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

exports.uploadPaymentLogo = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const url = `/uploads/${req.file.filename}`;
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

    const url = `/uploads/${req.file.filename}`;

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

