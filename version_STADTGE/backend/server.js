const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 4001; // Port auf 4001 setzen

// Middleware
app.use(cors({ origin: 'http://10.3.8.10:3000' })); // Erlaube CORS-Anfragen vom Frontend
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'public')));

// File upload setup
const upload = multer({ dest: 'public/uploads/' });

// In-Memory File Storage (for demonstration)
let files = [];

// Status Route
app.get('/', (req, res) => {
  res.send('Backend-Status: Aktiv');
});

// File-related Routes
app.get('/listFiles', (req, res) => {
  res.json(files);
});

app.get('/file/:filename', (req, res) => {
  const file = files.find(f => f.name === req.params.filename);
  if (file) {
    res.sendFile(path.join(__dirname, 'public', file.name));
  } else {
    res.status(404).send('File not found');
  }
});

app.post('/save', (req, res) => {
  const { filename, data } = req.body;
  const filePath = path.join(__dirname, 'public', filename);

  fs.writeFile(filePath, data, (err) => {
    if (err) return res.status(500).send('Error saving file');
    res.send('File saved');
  });
});

app.post('/upload', upload.single('file'), (req, res) => {
  if (req.file) {
    const file = { name: req.file.filename };
    files.push(file);
    res.send('File uploaded');
  } else {
    res.status(400).send('No file uploaded');
  }
});

app.post('/create', (req, res) => {
  const { filename } = req.body;
  const filePath = path.join(__dirname, 'public', filename);

  fs.writeFile(filePath, '', (err) => {
    if (err) return res.status(500).send('Error creating file');
    files.push({ name: filename });
    res.send('File created');
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://10.3.8.10:${port}`);
});
