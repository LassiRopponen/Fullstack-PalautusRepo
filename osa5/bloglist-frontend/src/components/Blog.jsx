import { useState } from 'react'

const Blog = ({ blog, handleLike, handleRemove, user }) => {
  const blogStyle = {
    paddingTop: 10,
    paddingLeft: 2,
    border: 'solid',
    borderWidth: 1,
    marginBottom: 5
  }

  const [visible, setVisible] = useState(false)

  return(
    <div style={blogStyle}>
      <div style={{ marginBottom: 0 }}>
        {blog.title} {blog.author} <button onClick={() => setVisible(!visible)}>{visible ? 'hide' : 'view'}</button>
      </div>
      <div style={{ display: visible ? '' : 'none' }}>
        <p>
          {blog.url} <br />
          likes {blog.likes} <button onClick={() => handleLike(blog)}>like</button> <br />
          {blog.user.name} <br />
          {(blog.user.id === user.id) && <button onClick={() => handleRemove(blog)}>remove</button>}
        </p>
      </div>
    </div>
  )}

export default Blog