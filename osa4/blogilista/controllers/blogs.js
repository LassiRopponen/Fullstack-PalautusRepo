const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const middleware = require('../utils/middleware')

blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog.find({}).populate('user', {username: 1, name: 1})
    response.json(blogs)
})

blogsRouter.post('/', middleware.userExtractor, async (request, response) => {
    const body = request.body
    const user = request.user

    const blog = new Blog({
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes ? body.likes : 0,
      user: user._id
    })

    const savedBlog = await blog.save()
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()

    response.status(201).json(savedBlog)
})

blogsRouter.delete('/:id', middleware.userExtractor, async (request, response) => {
  const user = request.user

  const blog = await Blog.findById(request.params.id)
  console.log(blog.user)
  if (blog.user.toString() === user._id.toString()) {
    await blog.deleteOne()
  }
  else {
    return response.status(401).json({ error: 'user not authorized to delete this blog' })
  }

  response.status(204).end()
})

blogsRouter.put('/:id', async (request, response) => {
  const { title, author, url, likes, user } = request.body

  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, { title, author, url, likes, user }, {new: true})
  if (updatedBlog) {
    response.json(updatedBlog)
  }
  else {
    response.status(404).end()
  }
})

module.exports = blogsRouter