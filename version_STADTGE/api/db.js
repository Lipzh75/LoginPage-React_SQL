import { Sequelize } from 'sequelize';

const sequelize = new Sequelize('user_auth', 'user_auth', 'Bazzliner05022003', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false, // Deaktivieren, wenn du keine SQL-Logs sehen möchtest
});

try {
  await sequelize.authenticate();
  console.log('Connection has been established successfully.');
} catch (error) {
  console.error('Unable to connect to the database:', error);
}

export default sequelize;
