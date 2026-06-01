// backend/server.js
const express = require('express');
const fs = require('fs');
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const DATA_FILE = './appointments.json';
let appointments = [];

// LOAD + REMOVE DUPLICATES
if (fs.existsSync(DATA_FILE)) {
  const data = JSON.parse(fs.readFileSync(DATA_FILE));

  const unique = {};
  data.forEach(a => {
    unique[a.email] = a;
  });

  appointments = Object.values(unique);
  fs.writeFileSync(DATA_FILE, JSON.stringify(appointments, null, 2));
}

// SAVE
function saveAppointments() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(appointments, null, 2));
}

// POST
app.post('/appointments', (req, res) => {
  const { name, age, email, date, service, phone, problem } = req.body;

  if (!name || !email || !date || !service || !problem) {
    return res.status(400).json({ error: 'Please fill all required fields' });
  }

  const exists = appointments.find(a => a.email === email);

  if (exists) {
    return res.status(400).json({ error: 'You already have an appointment!' });
  }

  const newAppointment = { name, age, email, date, service, phone, problem };
  appointments.push(newAppointment);
  saveAppointments();

  res.status(201).json({ message: 'Appointment booked!', appointment: newAppointment });
});

// GET
app.get('/appointments', (req, res) => {
  res.json(appointments);
});

// DELETE (EMAIL)
app.delete('/appointments/:email', (req, res) => {
  const email = req.params.email;

  appointments = appointments.filter(a => a.email !== email);
  saveAppointments();

  res.json({ message: 'Appointment removed' });
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));