const { test, after, beforeEach, before, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const User = require('../models/user')
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

let token = ""

before(async () => {
    await User.deleteMany({})

    const tester = {
        username: "tester",
        password: "testpassword"
    }

    await api
        .post("/api/users")
        .send(tester)

    const response = await api
        .post("/api/login")
        .send(tester)

    token = response.body.token
})

beforeEach(async () => {
    await Blog.deleteMany({})
    for (let blog of initialBlogs) {
        await api
            .post("/api/blogs")
            .set("Authorization", `Bearer ${token}`)
            .send(blog)
    }
})

describe("returned blogs", () => {
    test("are returned as json", async () => {
        await api
            .get("/api/blogs")
            .expect(200)
            .expect("Content-Type", /application\/json/)
    })
    
    test("include all blogs", async () => {
        const response = await api.get("/api/blogs")
    
        assert.strictEqual(response.body.length, initialBlogs.length)
    })
    
    test("have their identification in the id field", async () => {
        const response = await api.get("/api/blogs")
    
        response.body.map(blog => assert(blog.id))
    })
})

describe("adding a blog", () => {
    test("works", async () => {
        const newBlog = {
            title: "Type wars",
            author: "Robert C. Martin",
            url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
            likes: 2
        }
    
        await api
            .post("/api/blogs")
            .set("Authorization", `Bearer ${token}`)
            .send(newBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/)
    
        const response = await api.get("/api/blogs")
    
        assert.strictEqual(response.body.length, initialBlogs.length + 1)
    
        const titles = response.body.map(b => b.title)
        assert(titles.includes("Type wars"))
    })
    
    test("without like value works", async () => {
        const newBlog = {
            title: "Type wars",
            author: "Robert C. Martin",
            url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html"
        }
    
        await api
            .post("/api/blogs")
            .set("Authorization", `Bearer ${token}`)
            .send(newBlog)
    
        const response = await api.get("/api/blogs")
    
        assert.strictEqual(response.body[2].likes, 0)
    })
    
    test("without title gives error", async () => {
        const newBlog = {
            author: "Robert C. Martin",
            url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
            likes: 2
        }
    
        await api
            .post("/api/blogs")
            .set("Authorization", `Bearer ${token}`)
            .send(newBlog)
            .expect(400)
    })
    
    test("without url gives error", async () => {
        const newBlog = {
            title: "Type wars",
            author: "Robert C. Martin",
            likes: 2
        }
    
        await api
            .post("/api/blogs")
            .set("Authorization", `Bearer ${token}`)
            .send(newBlog)
            .expect(400)
    })

    test("without token gives error", async () => {
        const newBlog = {
            title: "Type wars",
            author: "Robert C. Martin",
            url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
            likes: 2
        }
    
        await api
            .post("/api/blogs")
            .send(newBlog)
            .expect(401)

        const response = await api.get("/api/blogs")
        assert.strictEqual(response.body.length, initialBlogs.length)
    })
})

test("deleting works", async () => {
    const start = await api.get("/api/blogs")
    const blogToDelete = start.body[0]

    await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(204)

    const end = await api.get("/api/blogs")

    assert.strictEqual(end.body.length, initialBlogs.length - 1)

    const titles = end.body.map(b => b.title)
    assert(!titles.includes(blogToDelete.title))
})

describe("updating a blog", () => {
    test("works", async () => {
        const start = await api.get("/api/blogs")
        blogToUpdate = start.body[0]
        blogToUpdate.likes = 15
    
        await api
            .put(`/api/blogs/${blogToUpdate.id}`)
            .send(blogToUpdate)
            .expect(200)
            .expect("Content-Type", /application\/json/)
    
        const end = await api.get("/api/blogs")
    
        assert.deepStrictEqual(end.body[0], blogToUpdate)
    })
    
    test("with wrong id gives error", async () => {
        const start = await api.get("/api/blogs")
        const blogToUpdate = { ...start.body[0] }
        blogToUpdate.likes = 15
        
        const wrongId = start.body[1].id
        await Blog.findByIdAndDelete(wrongId)
    
        await api
            .put(`/api/blogs/${wrongId}`)
            .send(blogToUpdate)
            .expect(404)
    
        const end = await api.get("/api/blogs")
    
        assert.deepStrictEqual(end.body[0], start.body[0])
    })
})

after(async () => {
    await mongoose.connection.close()
})