import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

const User = sequelize.define('User', {
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastLoggedIn: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  group: {
    type: DataTypes.ENUM,
    values: ['Admin', 'Editor', 'readOnly'],
    defaultValue: 'readOnly',
  },
});

export default User;
