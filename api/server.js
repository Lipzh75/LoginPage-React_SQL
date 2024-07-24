import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import User from './models/User.js';
import bcrypt from 'bcrypt';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import sequelize from './db.js'; // Importiere Sequelize

const secret = 'secret123';
const app = express();

app.use(cookieParser());
app.use(bodyParser.json({ extended: true }));
app.use(cors({
  credentials: true,
  origin: 'http://10.3.8.10:3000',
}));

app.get('/', (req, res) => {
  res.send('ok');
});

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
    res.json({ id: user.id, email: user.email });
  } catch (err) {
    res.status(401).json({});
  }
});

app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  try {
    const hashedPassword = bcrypt.hashSync(password, 10);
    const user = await User.create({ email, password: hashedPassword });
    jwt.sign({ id: user.id, email: user.email }, secret, (err, token) => {
      if (err) {
        console.log(err);
        res.sendStatus(500);
      } else {
        res.cookie('token', token).json({ id: user.id, email: user.email });
      }
    });
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.json({});
    }
    const passOk = bcrypt.compareSync(password, user.password);
    if (passOk) {
      jwt.sign({ id: user.id, email: user.email }, secret, (err, token) => {
        if (err) {
          console.log(err);
          res.sendStatus(500);
        } else {
          res.cookie('token', token).json({ id: user.id, email: user.email });
        }
      });
    } else {
      res.sendStatus(401);
    }
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

app.post('/logout', (req, res) => {
  res.cookie('token', '').send();
});

(async () => {
  try {
    await sequelize.sync({ alter: true }); // Synchronisiere die Datenbank
    console.log('Database synchronized.');
  } catch (error) {
    console.error('Unable to synchronize the database:', error);
  }
})();

app.listen(4000, () => {
  console.log('Server is running on port 4000');
});
