import { useState, useEffect } from 'react'
import personService from './services/persons'

const Filter = ({filter, handler}) => (
  <form>
    <div>filter shown with <input value={filter} onChange={handler} /></div>
  </form>
)

const Person = ({person, remove}) => (
  <>
    <p>{person.name} {person.number} <button onClick={remove}>delete</button></p>
  </>
)

const Persons = ({persons, removePerson}) => (
  persons.map(person => <Person key={person.id} person={person} remove={() => removePerson(person)} />)
)

const PersonForm = ({add, newName, newNumber, nameHandler, numberHandler}) => (
  <form onSubmit={add}>
    <div>name: <input value={newName} onChange={nameHandler} /></div>
    <div>number: <input value={newNumber} onChange={numberHandler} /></div>
    <div><button type="submit">add</button></div>
  </form >
)

const App = () => {
  const [persons, setPersons] = useState([]) 
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [filter, setFilter] = useState('')

  useEffect(() => {
    personService
      .getAll()
      .then(initialPersons => {
        setPersons(initialPersons)
      })
  }, [])

  const handleNameChange = (event) => (setNewName(event.target.value))
  const handleNumberChange = (event) => (setNewNumber(event.target.value))
  const handleFilterChange = (event) => (setFilter(event.target.value))

  const addPerson = (event) => {
    event.preventDefault()
    
    const oldPerson = persons.find(p => p.name === newName)
    if (oldPerson !== undefined) {
      if (confirm(`${newName} is already added to phonebook, replace the old number with a new one?`)) {
        const changedPerson = {...oldPerson, number: newNumber}
        personService
          .update(oldPerson.id, changedPerson)
          .then(response => {
            setPersons(persons.map(p => p.id !== oldPerson.id ? p : response))
          })
      }
    }
    else {
      const newPerson = {
        name: newName,
        number: newNumber
      }
      personService
        .create(newPerson)
          .then(returnedPerson => {
          setPersons(persons.concat(returnedPerson))
          })
    }

    setNewName('')
    setNewNumber('')
  }

  const removePerson = (person) => {
    if (confirm(`Delete ${person.name} ?`)) {
      personService.remove(person.id).then(response => {
        personService.getAll().then(newPersons => {
          setPersons(newPersons)
        })
      })
    }
  }

  const personsToShow = persons.filter(person => person.name.toLowerCase().includes(filter.toLowerCase()))

  return (
    <div>
      <h2>Phonebook</h2>
      <Filter filter={filter} handler={handleFilterChange} />
      <h2>add a new</h2>
      <PersonForm 
        add={addPerson} 
        newName={newName} 
        newNumber={newNumber} 
        nameHandler={handleNameChange} 
        numberHandler={handleNumberChange} 
      />
      <h2>Numbers</h2>
      <Persons persons={personsToShow} removePerson={removePerson} />
    </div>
  )

}

export default App