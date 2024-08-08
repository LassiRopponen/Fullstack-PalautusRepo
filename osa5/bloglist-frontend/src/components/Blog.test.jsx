import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Blog from './Blog'

test('renders title', () => {
  const blog = {
    title: 'test-blog',
    author: 'test-author',
    url: 'test.com',
    likes: 0,
    user: {
      id: '1',
      name: 'tester'
    }
  }

  render(<Blog blog={blog} user={blog.user} />)

  screen.getByText('test-blog', { exact: false })
})

test('view button works', async () => {
  const blog = {
    title: 'test-blog',
    author: 'test-author',
    url: 'test.com',
    likes: 0,
    user: {
      id: '1',
      name: 'tester'
    }
  }

  render(<Blog blog={blog} user={blog.user} />)

  const user = userEvent.setup()
  const button = screen.getByText('view')
  await user.click(button)

  expect(screen.getByText('test.com', { exact: false })).toBeVisible()
  expect(screen.getByText('0', { exact: false })).toBeVisible()
  expect(screen.getByText('tester', { exact: false })).toBeVisible()
})

test('like button works', async () => {
  const blog = {
    title: 'test-blog',
    author: 'test-author',
    url: 'test.com',
    likes: 0,
    user: {
      id: '1',
      name: 'tester'
    }
  }

  const mockHandler = vi.fn()

  render(<Blog blog={blog} user={blog.user} handleLike={mockHandler} />)

  const user = userEvent.setup()
  const button = screen.getByText('view')
  await user.click(button)

  const likeButton = screen.getByText('like')
  await user.click(likeButton)
  await user.click(likeButton)

  expect(mockHandler.mock.calls).toHaveLength(2)
})