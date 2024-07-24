const lodash = require('lodash')

const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    return blogs.reduce((sum, blog) => sum + blog.likes, 0)
}
  
const favoriteBlog = (blogs) => {
    if (blogs.length === 0) {
        return null
    }
    const max = blogs.reduce((a, b) => a.likes > b.likes ? a : b, blogs.at(0))
    return {title: max.title, author: max.author, likes: max.likes}
}

const mostBlogs = (blogs) => {
    if (blogs.length === 0) {
        return null
    }
    const result = lodash.toPairs(lodash.countBy(blogs, blog => blog.author)).reduce((a, b) => a.at(1) > b.at(1) ? a : b, [0, 0])
    console.log(result)
    return {author: result.at(0), blogs: result.at(1)}
}

const mostLikes = (blogs) => {
    if (blogs.length === 0) {
        return null
    }
    const result = {}
    blogs.forEach(blog => {
        const authorName = blog.author
        const likeAmount = blog.likes
        if (!result[authorName]) {
            result[authorName] = {author: authorName, likes: 0}
        }
        result[authorName].likes += likeAmount
    })

    return Object.values(result).reduce((a, b) => a.likes > b.likes ? a : b, {likes: 0})
}

module.exports = {
    dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes
}