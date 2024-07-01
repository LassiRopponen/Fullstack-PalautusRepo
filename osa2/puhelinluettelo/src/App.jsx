import { useState } from 'react'

const Filter = ({filter, handler}) => (
  <form>
    <div>filter shown with <input value={filter} onChange={handler} /></div>
  </form>
)

const Person = ({person}) => (
  <p>{person.name} {person.number}</p>
)

const Persons = ({persons, filter}) => (
  persons.map(person => <Person key={person.name} person={person} />)
)

const PersonForm = ({add, newName, newNumber, nameHandler, numberHandler}) => (
  <form onSubmit={add}>
    <div>name: <input value={newName} onChange={nameHandler} /></div>
    <div>number: <input value={newNumber} onChange={numberHandler} /></div>
    <div><button type="submit">add</button></div>
  </form >
)

const App = () => {
  const [persons, setPersons] = useState([
    { name: 'Arto Hellas', number: '040-123456' },
    { name: 'Ada Lovelace', number: '39-44-5323523' },
    { name: 'Dan Abramov', number: '12-43-234345' },
    { name: 'Mary Poppendieck', number: '39-23-6423122' }
  ]) 
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [filter, setFilter] = useState('')

  const handleNameChange = (event) => (setNewName(event.target.value))
  const handleNumberChange = (event) => (setNewNumber(event.target.value))
  const handleFilterChange = (event) => (setFilter(event.target.value))

  const addPerson = (event) => {
    event.preventDefault()
    
    if (persons.some(p => p.name === newName)) {
      alert(`${newName} is already added to phonebook`)
    }
    else {
      const personObject = {
        name: newName,
        number: newNumber
      }
      setPersons(persons.concat(personObject))
    }

    setNewName('')
    setNewNumber('')
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
      <Persons persons={personsToShow} filter={filter} />
    </div>
  )

}

export default App