import { useState, useEffect, useRef } from 'react'
import Blog from './components/Blog'
import Togglable from './components/Togglable'
import BlogForm from './components/BlogForm'
import blogService from './services/blogs'
import loginService from './services/login'

const Notification = ({ message, error }) => {
  if (message === null) {
    return null
  }
  const style = {
    color: error ? 'red' : 'green'
  }
  return (
    <div className="notification" style={style}>
      {message}
    </div>
  )
}

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(false)

  const blogFormRef = useRef()

  useEffect(() => {
    blogService.getAll().then(blogs =>
      setBlogs( blogs.sort((a, b) => b.likes - a.likes ) )
    )
  }, [])

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogappUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      blogService.setToken(user.token)
    }
  }, [])

  const handleLogin = async (event) => {
    event.preventDefault()

    try {
      const user = await loginService.login({
        username, password,
      })

      window.localStorage.setItem(
        'loggedBlogappUser', JSON.stringify(user)
      )
      blogService.setToken(user.token)
      setUser(user)
      setUsername('')
      setPassword('')
    } catch (exception) {
      setNotification('wrong username or password', true)
    }
  }

  const handleLogout = (event) => {
    event.preventDefault()

    window.localStorage.removeItem('loggedBlogappUser')
    setUser(null)
  }

  const handleCreate = async (title, author, url) => {
    try {
      await blogService.create({
        title, author, url
      })
      setNotification(`a new blog ${title} by ${author} added`, false)
      blogFormRef.current.toggleVisibility()
      blogService.getAll().then(blogs =>
        setBlogs( blogs.sort((a, b) => b.likes - a.likes ) )
      )
    }
    catch (exception) {
      setNotification('title and url required', true)
    }
  }

  const handleLike = async blog => {
    blog.likes++
    await blogService.update(
      {
        title: blog.title,
        author: blog.author,
        url: blog.url,
        likes: blog.likes,
        user: blog.user.id
      },
      blog.id
    )
    setBlogs(blogs.map(b => (b.id === blog.id ? { ...b, likes: b.likes++ } : b)).sort((a, b) => b.likes - a.likes))
  }

  const handleRemove = async blog => {
    if (confirm(`Remove blog ${blog.title} by ${blog.author}`)) {
      await blogService.remove(blog.id)
      setBlogs(blogs.filter(b => b.id !== blog.id))
    }
  }

  const setNotification = (message, error) => {
    setError(error)
    setMessage(message)
    setTimeout(() => {
      setMessage(null)
    }, 5000)
  }

  if (user === null) {
    return (
      <div>
        <h2>log in to application</h2>
        <Notification message={message} error={error} />
        <form onSubmit={handleLogin} data-testid='login-form'>
          <div>
          username
            <input
              type="text"
              value={username}
              data-testid="username-input"
              onChange={({ target }) => setUsername(target.value)}
            />
          </div>
          <div>
          password
            <input
              type="password"
              value={password}
              data-testid="password-input"
              onChange={({ target }) => setPassword(target.value)}
            />
          </div>
          <button type="submit">login</button>
        </form>
      </div>
    )
  }

  return (
    <div>
      <h2>blogs</h2>
      <Notification message={message} error={error} />
      <p>{user.name} logged in <button onClick={handleLogout}>logout</button></p>
      <Togglable buttonLabel="create new blog" ref={blogFormRef}>
        <BlogForm handleCreate={handleCreate} />
      </Togglable>
      {blogs.map(blog =>
        <Blog key={blog.id} blog={blog} handleLike={handleLike} handleRemove={handleRemove} user={user} />
      )}
    </div>
  )
}

export default App