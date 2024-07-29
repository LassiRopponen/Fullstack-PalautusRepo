const { test, after, beforeEach, before, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const User = require('../models/user')
const api = supertest(app)

const initialUsers = [
    {
        username: "Batman",
        name: "Bruce Wayne",
        password: "alfred1234"
    }
]

before(async () => {
    await User.deleteMany({})
    await User.insertMany(initialUsers)
})

describe("correct error when", () => {
    test("username doesn't exist", async () => {
        const newUser = {
            name: "Peter Parker",
            password: "webslinger47"
        }

        const result = await api
            .post("/api/users")
            .send(newUser)
            .expect(400)

        assert(result.body.error.includes("a `username` is required"))

        const response = await api.get("/api/users")

        assert.strictEqual(response.body.length, initialUsers.length)
    })

    test("password doesn't exist", async () => {
        const newUser = {
            username: "Spiderman",
            name: "Peter Parker",
        }

        const result = await api
            .post("/api/users")
            .send(newUser)
            .expect(400)

        assert(result.body.error.includes('expected `password` to be at least 3 characters long'))

        const response = await api.get("/api/users")

        assert.strictEqual(response.body.length, initialUsers.length)
    })

    test("username is too short", async () => {
        const newUser = {
            username: "Sp",
            name: "Peter Parker",
            password: "webslinger47"
        }

        const result = await api
            .post("/api/users")
            .send(newUser)
            .expect(400)

        assert(result.body.error.includes("expected `username` to be at least 3 characters long"))

        const response = await api.get("/api/users")

        assert.strictEqual(response.body.length, initialUsers.length)
    })

    test("password is too short", async () => {
        const newUser = {
            username: "Spiderman",
            name: "Peter Parker",
            password: "we"
        }

        const result = await api
            .post("/api/users")
            .send(newUser)
            .expect(400)

        assert(result.body.error.includes('expected `password` to be at least 3 characters long'))

        const response = await api.get("/api/users")

        assert.strictEqual(response.body.length, initialUsers.length)
    })

    test("username isn't unique", async () => {
        const newUser = {
            username: "Batman",
            name: "Peter Parker",
            password: "webslinger47"
        }

        const result = await api
            .post("/api/users")
            .send(newUser)
            .expect(400)

        assert(result.body.error.includes('expected `username` to be unique'))

        const response = await api.get("/api/users")

        assert.strictEqual(response.body.length, initialUsers.length)
    })
})

after(async () => {
    await mongoose.connection.close()
})