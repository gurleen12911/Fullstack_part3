const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001


app.use(cors());
app.use(express.json());

let phonebookEntries = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
];

function generateUniqueId() {
    const minId = 1;
    const maxId = 100000; 
    let newId;

    do {
        newId = Math.floor(Math.random() * (maxId - minId + 1)) + minId;
    } while (phonebookEntries.some(entry => entry.id === newId));

    return newId;
}

morgan.token('postData', (req, res) => {
    if (req.method === 'POST') {
        return JSON.stringify(req.body);
    }
    return '';
});

app.use(morgan('tiny :method :url :status :res[content-length] - :response-time ms :postData'));

app.get('/api/persons', (req, res) => {
    res.json(phonebookEntries);
});

app.get('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id);
    const entry = phonebookEntries.find(entry => entry.id === id);

    if (entry) {
        res.json(entry);
    } else {
        res.status(404).end();
    }
});

app.delete('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id);
    phonebookEntries = phonebookEntries.filter(entry => entry.id !== id);
    res.status(204).end();
});

app.post('/api/persons', (req, res) => {
    const body = req.body;

    if (!body.name || !body.number) {
        return res.status(400).json({ error: 'name and number are required' });
    }

    if (phonebookEntries.some(entry => entry.name === body.name)) {
        return res.status(400).json({ error: 'name must be unique' });
    }

    const newEntry = {
        id: generateUniqueId(),
        name: body.name,
        number: body.number
    };

    phonebookEntries.push(newEntry);

    res.json(newEntry);
});

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' });
};
app.use(unknownEndpoint);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
