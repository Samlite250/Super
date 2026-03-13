/**
 * Migration: add payerNumber, payerNames, proofUploadedAt to Deposits
 */
'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Deposits', 'payerNumber', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('Deposits', 'payerNames', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('Deposits', 'proofUploadedAt', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Deposits', 'proofUploadedAt');
    await queryInterface.removeColumn('Deposits', 'payerNames');
    await queryInterface.removeColumn('Deposits', 'payerNumber');
  }
};
