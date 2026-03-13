const { Referral, User, Setting } = require('../models');

exports.getStats = async (req, res) => {
  const referred = await Referral.findAll({ where: { referrerId: req.user.id } });
  const totalUsers = referred.length;
  const totalEarnings = referred.reduce((sum, r) => sum + parseFloat(r.commission), 0);
  res.json({ totalUsers, totalEarnings });
};

exports.getMyReferrals = async (req, res) => {
  try {
    // Fetch all users who were referred by the current user
    const downline = await User.findAll({
      where: { referredBy: req.user.id },
      attributes: ['id', 'username', 'email', 'fullName', 'createdAt'],
      include: [
        { 
          model: Referral, 
          attributes: ['commission'],
          where: { referrerId: req.user.id },
          required: false // Left join to show users even if they haven't generated commission yet
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Map the result to match the frontend's expected format
    const results = downline.map(u => ({
      id: u.id,
      createdAt: u.createdAt,
      commission: u.Referrals && u.Referrals.length > 0 ? u.Referrals[0].commission : 0,
      referredUser: {
        id: u.id,
        username: u.username,
        email: u.email,
        fullName: u.fullName,
        createdAt: u.createdAt
      }
    }));

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load team downlines' });
  }
};
