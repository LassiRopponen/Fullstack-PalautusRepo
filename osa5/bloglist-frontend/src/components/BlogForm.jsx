import { useState } from 'react'
import PropTypes from 'prop-types'

const BlogForm = ({ handleCreate }) => {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [url, setUrl] = useState('')

  const addBlog = (event) => {
    event.preventDefault()
    handleCreate(title, author, url)
    setTitle('')
    setAuthor('')
    setUrl('')
  }

  return(<>
    <br />
    <h2>create new</h2>
    <form onSubmit={addBlog}>
      <div>
            title
        <input
          type="text"
          value={title}
          id="title-input"
          data-testid="title-input"
          onChange={({ target }) => setTitle(target.value)}
        />
      </div>
      <div>
            author
        <input
          type="text"
          value={author}
          id="author-input"
          data-testid="author-input"
          onChange={({ target }) => setAuthor(target.value)}
        />
      </div>
      <div>
            url
        <input
          type="text"
          value={url}
          id="url-input"
          data-testid="url-input"
          onChange={({ target }) => setUrl(target.value)}
        />
      </div>
      <button type="submit">create</button>
    </form>
  </>)
}

BlogForm.propTypes = {
  handleCreate: PropTypes.func.isRequired
}

export default BlogForm