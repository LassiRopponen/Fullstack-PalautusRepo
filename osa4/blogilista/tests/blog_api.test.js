const { test, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const api = supertest(app)

const initialBlogs = [
    {
        title: "React patterns",
        author: "Michael Chan",
        url: "https://reactpatterns.com/",
        likes: 7
    },
    {
        title: "Go To Statement Considered Harmful",
        author: "Edsger W. Dijkstra",
        url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
        likes: 5
    }
]

beforeEach(async () => {
    await Blog.deleteMany({})
    await Blog.insertMany(initialBlogs)
})

test("blogs are returned as json", async () => {
    await api
        .get("/api/blogs")
        .expect(200)
        .expect("Content-Type", /application\/json/)
})

test("all blogs are returned", async () => {
    const response = await api.get("/api/blogs")

    assert.strictEqual(response.body.length, initialBlogs.length)
})

test("identification is in id field", async () => {
    const response = await api.get("/api/blogs")

    response.body.map(blog => assert(blog.id))
})

test("adding a blog works", async () => {
    const newBlog = {
        title: "Type wars",
        author: "Robert C. Martin",
        url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
        likes: 2
    }

    await api
        .post("/api/blogs")
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

    const response = await api.get("/api/blogs")

    assert.strictEqual(response.body.length, initialBlogs.length + 1)

    const titles = response.body.map(b => b.title)
    assert(titles.includes("Type wars"))
})

test("adding without like value works", async () => {
    const newBlog = {
        title: "Type wars",
        author: "Robert C. Martin",
        url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html"
    }

    await api
        .post("/api/blogs")
        .send(newBlog)

    const response = await api.get("/api/blogs")

    assert.strictEqual(response.body[2].likes, 0)
})

test("adding without title gives error", async () => {
    const newBlog = {
        author: "Robert C. Martin",
        url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
        likes: 2
    }

    await api
        .post("/api/blogs")
        .send(newBlog)
        .expect(400)
})

test("adding without url gives error", async () => {
    const newBlog = {
        title: "Type wars",
        author: "Robert C. Martin",
        likes: 2
    }

    await api
        .post("/api/blogs")
        .send(newBlog)
        .expect(400)
})


after(async () => {
    await mongoose.connection.close()
})