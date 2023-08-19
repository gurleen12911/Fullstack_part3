const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const mongoose = require('mongoose');
const Person = require('./models/person'); // Import the Person model from your models directory
require('dotenv').config(); // Load environment variables from .env file
const url = process.env.MONGODB_URI;

const app = express();
const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Connect to the MongoDB database
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error.message);
  });


app.use(express.static('build'));
app.use(cors());
app.use(express.json());

// Route handler for fetching all phonebook entries
app.get('/api/persons', (req, res, next) => {
  Person.find({})
    .then(entries => {
      res.json(entries);
    })
    .catch(error => next(error));
});

// Route handler for adding a new phonebook entry
app.post('/api/persons', (req, res, next) => {
  const body = req.body;

  const newPerson = new Person({
    name: body.name,
    number: body.number,
  });

  newPerson.save()
    .then(savedPerson => {
      res.json(savedPerson);
    })
    .catch(error => next(error));
});

// Route handler for fetching a single entry by ID
app.get('/api/persons/:id', (req, res, next) => {
  const id = req.params.id;

  Person.findById(id)
    .then(entry => {
      if (entry) {
        res.json(entry);
      } else {
        res.status(404).json({ error: 'Entry not found' });
      }
    })
    .catch(error => next(error));
});

// Route handler for deleting an entry by ID
app.delete('/api/persons/:id', (req, res, next) => {
  const id = req.params.id;

  Person.findByIdAndRemove(id)
    .then(() => {
      res.status(204).end();
    })
    .catch(error => next(error));
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
