import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Notification from './Notification';

const App = () => {
  const [persons, setPersons] = useState([]);
  const [newName, setNewName] = useState('');
  const [newNumber, setNewNumber] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    axios
      .get('/api/persons')
      .then((response) => {
        console.log(response.data);
        setPersons(response.data);
      })
      .catch((error) => {
        console.log('Error fetching data from server:', error);
      });
  }, []);

  const handleNameChange = (event) => {
    setNewName(event.target.value);
  };

  const handleNumberChange = (event) => {
    setNewNumber(event.target.value);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const addPerson = (event) => {
    event.preventDefault();

    const existingPerson = persons.find((person) => person.name === newName);

    if (existingPerson) {
      if (
        window.confirm(
          `${newName} is already added to the phonebook. Replace the old number with a new one?`
        )
      ) {
        const updatedPerson = { ...existingPerson, number: newNumber };
        
        console.log(`Updating person with URL: /api/persons/${existingPerson.id}`);
        axios
          .put(`/api/persons/${existingPerson.id}`, updatedPerson)
          .then((response) => {
            setPersons(
              persons.map((person) =>
                person.id !== existingPerson.id ? person : response.data
              )
            );
            setNewName('');
            setNewNumber('');
            setSuccessMessage(`Number for ${response.data.name} updated successfully.`);
            setTimeout(() => {
              setSuccessMessage(null);
            }, 5000);
          })
          .catch((error) => {
            if (error.response && error.response.status === 404) {
              setErrorMessage(`Information of ${existingPerson.name} has already been removed from server.`);
            } else {
              console.log('Error updating person:', error);
              setErrorMessage(`Failed to update the number for ${existingPerson.name}.`);
            }
            setTimeout(() => {
              setErrorMessage(null);
            }, 5000);
          });
      }
    } else {
      const personObject = {
        name: newName,
        number: newNumber,
      };

      axios
        .post('/api/persons', personObject)
        .then((response) => {
          setPersons(persons.concat(response.data));
          setNewName('');
          setNewNumber('');
          setSuccessMessage(`Person '${response.data.name}' added successfully.`);
          setTimeout(() => {
            setSuccessMessage(null);
          }, 5000);
        })
        .catch((error) => {
          console.log('Error adding person:', error);
          if (error.response && error.response.data.error) {
            setErrorMessage(error.response.data.error);
          } else {
            setErrorMessage('Failed to add the person.');
          }
          setTimeout(() => {
            setErrorMessage(null);
          }, 5000);
        });
    }
  };

  const deletePerson = (id) => {
    const personToDelete = persons.find((person) => person.id === id);

    if (personToDelete && window.confirm(`Delete ${personToDelete.name}?`)) {
      axios
        .delete(`/api/persons/${id}`)
        .then(() => {
          setPersons(persons.filter((person) => person.id !== id));
          setSuccessMessage(`Person '${personToDelete.name}' deleted successfully.`);
          setTimeout(() => {
            setSuccessMessage(null);
          }, 5000);
        })
        .catch((error) => {
          console.log('Error deleting person:', error);
          setErrorMessage(`Failed to delete ${personToDelete.name}.`);
          setTimeout(() => {
            setErrorMessage(null);
          }, 5000);
        });
    }
  };

  const filteredPersons = persons.filter((person) => {
    if (person && person.name) {
      return person.name.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return false;
  });

  return (
    <div>
      <h2>Phonebook</h2>

      <div>
        Filter shown with:
        <input value={searchTerm} onChange={handleSearchChange} />
      </div>

      <h3>Add a new</h3>

      <form onSubmit={addPerson}>
        <div>
          Name: <input value={newName} onChange={handleNameChange} />
        </div>
        <div>
          Number: <input value={newNumber} onChange={handleNumberChange} />
        </div>
        <div>
          <button type="submit">Add</button>
        </div>
      </form>

      <h3>Numbers</h3>

      {errorMessage && <Notification message={errorMessage} isError={true} />}
      {successMessage && <Notification message={successMessage} isError={false} />}

      <ul>
        {filteredPersons.map((person) => (
          <li key={person.id}>
            {person.name} {person.number}
            <button onClick={() => deletePerson(person.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;
