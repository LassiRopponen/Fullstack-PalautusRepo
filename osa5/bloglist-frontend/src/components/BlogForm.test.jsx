import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BlogForm from './BlogForm'

test('<NoteForm /> updates parent state and calls onSubmit', async () => {
  const user = userEvent.setup()
  const createBlog = vi.fn()

  const { container } = render(<BlogForm handleCreate={createBlog} />)

  const titleInput = container.querySelector('#title-input')
  const authorInput = container.querySelector('#author-input')
  const urlInput = container.querySelector('#url-input')
  const sendButton = screen.getByText('create')

  await user.type(titleInput, 'test-blog')
  await user.type(authorInput, 'test-author')
  await user.type(urlInput, 'test.com')
  await user.click(sendButton)

  expect(createBlog.mock.calls).toHaveLength(1)
  expect(createBlog.mock.calls[0][0]).toBe('test-blog')
  expect(createBlog.mock.calls[0][1]).toBe('test-author')
  expect(createBlog.mock.calls[0][2]).toBe('test.com')
})