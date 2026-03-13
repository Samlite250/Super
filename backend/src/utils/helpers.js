exports.generateReferralCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

exports.formatCurrency = (amount, currency) => {
  return `${currency} ${parseFloat(amount).toFixed(2)}`;
};
