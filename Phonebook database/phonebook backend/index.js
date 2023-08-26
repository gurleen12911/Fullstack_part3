const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Person = require('./models/person');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error.message);
  });

app.use(express.static('build'));
app.use(cors());
app.use(express.json());

app.get('/api/persons', async (req, res, next) => {
  try {
    const entries = await Person.find({});
    res.json(entries);
  } catch (error) {
    next(error);
  }
});

app.post('/api/persons', async (req, res, next) => {
  const body = req.body;

  try {
    const existingPerson = await Person.findOne({ name: body.name });

    if (existingPerson) {
      const updatedPerson = { ...existingPerson.toObject(), number: body.number };
      const updatedPersonResult = await Person.findByIdAndUpdate(existingPerson.id, updatedPerson, { new: true });

      res.json(updatedPersonResult);
    } else {
      const newPerson = new Person({
        name: body.name,
        number: body.number,
      });

      const savedPerson = await newPerson.save();
      res.json(savedPerson);
    }
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
});

app.get('/api/persons/info', async (req, res, next) => {
  try {
    const entries = await Person.find({});
    const info = `
      Phonebook has ${entries.length} entries. 
      Date: ${new Date().toString()}
    `;
    res.send(info);
  } catch (error) {
    next(error);
  }
});

app.get('/api/persons/:id', async (req, res, next) => {
  const id = req.params.id;

  try {
    const entry = await Person.findById(id);
    if (entry) {
      res.json(entry);
    } else {
      res.status(404).json({ error: 'Entry not found' });
    }
  } catch (error) {
    next(error);
  }
});

app.put('/api/persons/:id', async (req, res, next) => {
  const id = req.params.id;
  const updatedInfo = req.body;

  try {
    const updatedPerson = await Person.findByIdAndUpdate(id, updatedInfo, { new: true, runValidators: true, context: 'query' });
    if (updatedPerson) {
      res.json(updatedPerson);
    } else {
      res.status(404).json({ error: 'Person not found' });
    }
  } catch (error) {
    next(error);
  }
});

app.delete('/api/persons/:id', async (req, res, next) => {
  const id = req.params.id;

  try {
    await Person.findByIdAndRemove(id);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

// Error handling middleware
const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'Malformatted id' });
  }

  next(error);
};

app.use(errorHandler);

// Start of validation middleware
app.use((error, req, res, next) => {
  if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message });
  }
  next(error);
});
// End of validation middleware

module.exports = app;
