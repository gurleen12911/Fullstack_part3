const mongoose = require('mongoose');

if (process.argv.length < 3) {
  console.log('Usage: node mongo.js <password> [name] [phone]');
  process.exit(1);
}

const password = process.argv[2];
const dbName = 'phbook';
const url = `mongodb+srv://phbook:${password}@cluster0.e0if99k.mongodb.net/${dbName}?retryWrites=true&w=majority`;

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });

const personSchema = new mongoose.Schema({
  name: String,
  phone: String,
});

const Person = mongoose.model('Person', personSchema);

if (process.argv.length === 3) {
  // List all entries
  Person.find({}).then(persons => {
    console.log('phonebook:');
    persons.forEach(person => {
      console.log(`${person.name} ${person.phone}`);
    });
    mongoose.connection.close();
  });
} else if (process.argv.length === 5) {
  // Add a new entry
  const name = process.argv[3];
  const phone = process.argv[4];

  const person = new Person({
    name,
    phone,
  });

  person.save().then(() => {
    console.log(`added ${name} number ${phone} to phonebook`);
    mongoose.connection.close();
  });
} else {
  console.log('Usage: node mongo.js <password> [name] [phone]');
  mongoose.connection.close();
}
