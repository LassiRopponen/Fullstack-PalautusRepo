const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: [true, "a `username` is required"],
        minLength: [3, "expected `username` to be at least 3 characters long"],
        unique: true
    },
    name: String,
    passwordHash: String,
    blogs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Blog'
      }
    ]
})

userSchema.set('toJSON', {
    transform: (document, returnedObject) => {
      returnedObject.id = returnedObject._id.toString()
      delete returnedObject._id
      delete returnedObject.__v
      delete returnedObject.passwordHash
    }
  })

const User = mongoose.model('User', userSchema)

module.exports = User