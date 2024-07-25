import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import User from './models/User.js';
import bcrypt from 'bcrypt';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import sequelize from './db.js';

const secret = 'secret123';
const app = express();

app.use(cookieParser());
app.use(bodyParser.json());
app.use(cors({
  credentials: true,
  origin: 'http://10.3.8.10:3000',
}));

app.get('/', (req, res) => {
  res.send('API-Status: Aktiv');
});

// Endpoint to get the current user's data
app.get('/user', async (req, res) => {
  if (!req.cookies.token) {
    return res.json({});
  }
  try {
    const payload = jwt.verify(req.cookies.token, secret);
    const user = await User.findByPk(payload.id);
    if (!user) {
      return res.json({});
    }
    res.json({ id: user.id, email: user.email, lastLoggedIn: user.lastLoggedIn, group: user.group });
  } catch (err) {
    res.status(401).json({});
  }
});

// Endpoint to check if the current user is an admin
app.get('/check-admin', async (req, res) => {
  if (!req.cookies.token) {
    return res.json({ allowed: false });
  }

  try {
    const payload = jwt.verify(req.cookies.token, secret);
    const user = await User.findByPk(payload.id);
    if (user && user.group === 'Admin') {
      return res.json({ allowed: true });
    } else {
      return res.json({ allowed: false });
    }
  } catch (err) {
    return res.json({ allowed: false });
  }
});

// Endpoint to create a new user (admin only)
app.post('/createUser', async (req, res) => {
  if (!req.cookies.token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  try {
    const payload = jwt.verify(req.cookies.token, secret);
    const currentUser = await User.findByPk(payload.id);
    if (currentUser.group !== 'Admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const { email, password, group } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    await User.create({ email, password: hashedPassword, group });
    res.sendStatus(201);
  } catch (err) {
    res.status(500).json({ message: 'Error creating user' });
  }
});

// Endpoint to get a list of all users (admin only)
app.get('/users', async (req, res) => {
  if (!req.cookies.token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  try {
    const payload = jwt.verify(req.cookies.token, secret);
    const currentUser = await User.findByPk(payload.id);
    if (currentUser.group !== 'Admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const users = await User.findAll();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Endpoint to update a user's group (admin only)
app.post('/updateUserGroup/:userId', async (req, res) => {
  if (!req.cookies.token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  try {
    const payload = jwt.verify(req.cookies.token, secret);
    const currentUser = await User.findByPk(payload.id);
    if (currentUser.group !== 'Admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const { group } = req.body;
    const validGroups = ['Admin', 'Editor', 'readOnly'];
    if (!validGroups.includes(group)) {
      return res.status(400).json({ message: 'Invalid group' });
    }
    await User.update({ group }, { where: { id: req.params.userId } });
    res.sendStatus(200);
  } catch (err) {
    res.status(500).json({ message: 'Error updating user group' });
  }
});


// Endpoint to delete a user (admin only)
app.delete('/deleteUser/:userId', async (req, res) => {
  if (!req.cookies.token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  try {
    const payload = jwt.verify(req.cookies.token, secret);
    const currentUser = await User.findByPk(payload.id);
    if (currentUser.group !== 'Admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    await User.destroy({ where: { id: req.params.userId } });
    res.sendStatus(200);
  } catch (err) {
    res.status(500).json({ message: 'Error deleting user' });
  }
});

// Endpoint to handle login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const passOk = bcrypt.compareSync(password, user.password);
    if (passOk) {
      user.lastLoggedIn = new Date();
      await user.save();
      jwt.sign({ id: user.id, email: user.email, group: user.group }, secret, (err, token) => {
        if (err) {
          console.log(err);
          res.sendStatus(500);
        } else {
          res.cookie('token', token).json({ id: user.id, email: user.email, group: user.group });
        }
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

// Endpoint to handle logout
app.post('/logout', (req, res) => {
  res.cookie('token', '').send();
});

(async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('Database synchronized.');
  } catch (error) {
    console.error('Unable to synchronize the database:', error);
  }
})();

app.listen(4000, () => {
  console.log('Server is running on port 4000');
});
