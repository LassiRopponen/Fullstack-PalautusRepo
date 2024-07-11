import { useState, useEffect } from 'react'
import axios from 'axios'

const SearchForm = ({countryName, handler}) => (
  <form>
    <div>find countries <input value={countryName} onChange={handler} /></div>
  </form>
)

const CountryBox = ({list, handleShow, weather}) => {
  if (list.length > 10) {
    return <p>Too many matches, specify another filter</p>
  }
  else if (list.length === 1) {
    return <CountryInfo country={list[0]} weather={weather} />
  }
  else {
    return <CountryList list={list} handler={handleShow} />
  }
}

const CountryList = ({list, handler}) => (
  list.map(country => <p key={country.name.common}>
    {country.name.common}
    <button onClick={() => handler(country.name.common)}>show</button>
  </p>)
)

const CountryInfo = ({country, weather}) => (
  <>
    <h2>{country.name.common}</h2>
    <p>capital {country.capital}<br />area {country.area}</p>
    <b>languages:</b>
    <ul>
    <Languages languages={country.languages} />
    </ul>
    <img src={country.flags.png}></img>
    <Weather capital={country.capital[0]} weather={weather} />
  </> 
)

const Languages = ({languages}) => (
  Object.values(languages).map(language =>
    <li key={language}>{language}</li>
  )
)

const Weather = ({capital, weather}) => {
  if (weather) {
  return(<>
    <h2>Weather in {capital}</h2>
    <p>temperature {weather.main.temp} Celsius</p>
    <img src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}></img>
    <p>wind {weather.wind.speed} m/s</p>
  </>)
  } 
}

function App() {
  const [countryName, setCountryName] = useState("")
  const [countries, setCountries] = useState([])
  const [location, setLocation] = useState(null)
  const [weather, setWeather] = useState(null)

  const api_key = import.meta.env.VITE_SOME_KEY

  useEffect(() => {
    axios
      .get("https://studies.cs.helsinki.fi/restcountries/api/all")
      .then(response => setCountries(response.data))
  }, [])

  const countrySearch = countries.filter(country => 
    country.name.common.toLowerCase().includes(countryName.toLowerCase()))

  useEffect(() =>  {
    if (countrySearch.length === 1) {
      const city = countrySearch[0].capital[0]
      axios
        .get(`http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${api_key}`)
        .then(response => setLocation(response.data))
      if (location) {
        console.log(location)
        const lat = location[0].lat
        const lon = location[0].lon
        axios
          .get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${api_key}`)
          .then(response => setWeather(response.data))
      }
    }
    }, [countryName])

  const handleCountryChange = (event) => (setCountryName(event.target.value))

  const handleShow = (name) => (setCountryName(name))

  if (countries) {
    return (
      <div>
        <SearchForm countryName={countryName} handler={handleCountryChange} />
        <CountryBox list={countrySearch} handleShow={handleShow} weather={weather}/>
      </div>
    )
  }
  
}

export default App
