import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';  // Import Sequelize instance

const Address = sequelize.define('Address', {
  houseNumber: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  road: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,  // Example: Home, Office, Friends & Family
  },
  latitude: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  longitude: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
}, {
  tableName: 'addresses',  // The name of the table
  timestamps: false,  // Disable timestamps (createdAt/updatedAt) if you don't want them
});

export default Address;