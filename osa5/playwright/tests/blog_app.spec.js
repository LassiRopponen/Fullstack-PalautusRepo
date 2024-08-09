const { test, expect, beforeEach, describe } = require('@playwright/test')

describe('Blog app', () => {
  beforeEach(async ({ page, request }) => {
    await request.post('http:localhost:3003/api/testing/reset')
    await request.post('http://localhost:3003/api/users', {
      data: {
        name: 'Playwright Tester',
        username: 'tester',
        password: 'password'
      }
    })
    await request.post('http://localhost:3003/api/users', {
      data: {
        name: 'Unauthorized User',
        username: 'wronguser',
        password: 'secret'
      }
    })

    await page.goto('http://localhost:5173')
  })

  test('Login form is shown', async ({ page }) => {
    await expect(page.getByTestId('login-form')).toBeVisible()
  })

  describe('Login', () => {
    test('succeeds with correct credentials', async ({ page }) => {
      await page.getByTestId('username-input').fill('tester')
      await page.getByTestId('password-input').fill('password')
      await page.getByRole('button').click()
      
      await expect(page.getByText('Playwright Tester logged in')).toBeVisible()
    })

    test('fails with wrong credentials', async ({ page }) => {
      await page.getByTestId('username-input').fill('tester')
      await page.getByTestId('password-input').fill('wrong')
      await page.getByRole('button').click()
      
      await expect(page.getByText('wrong username or password')).toBeVisible()
    })
  })

  describe('When logged in', () => {
    beforeEach(async ({ page }) => {
      await page.getByTestId('username-input').fill('tester')
      await page.getByTestId('password-input').fill('password')
      await page.getByRole('button').click()
    })
  
    test('a new blog can be created', async ({ page }) => {
      await page.getByRole('button', {name: 'create new blog'}).click()
      await page.getByTestId('title-input').fill('test blog')
      await page.getByTestId('author-input').fill('test blogger')
      await page.getByTestId('url-input').fill('testblog.com')
      await page.getByRole('button', {name: 'create'}).click()

      await expect(page.getByText('test blog test blogger')).toBeVisible()
    })

    describe('and a blog exists', () => {
      beforeEach(async ({ page }) => {
        await page.getByRole('button', {name: 'create new blog'}).click()
        await page.getByTestId('title-input').fill('test blog')
        await page.getByTestId('author-input').fill('test blogger')
        await page.getByTestId('url-input').fill('testblog.com')
        await page.getByRole('button', {name: 'create'}).click()
        await page.getByText('test blog test blogger').waitFor()
      })

      test('the blog can be liked', async ({ page }) => {
        await page.getByRole('button', {name: 'view'}).click()
        await page.getByRole('button', {name: 'like'}).click()

        await expect(page.getByText('likes 1')).toBeVisible()
      })

      test('the blog can be removed', async ({ page }) => {
        page.on('dialog', dialog => dialog.accept())
        await page.getByRole('button', {name: 'view'}).click()
        await page.getByRole('button', {name: 'remove'}).click()

        await expect(page.getByText('test blog test blogger')).not.toBeVisible()
      })

      test('the blog can not be removed by unauthorized user', async ({ page }) => {
        await page.getByRole('button', {name: 'logout'}).click()
        await page.getByTestId('username-input').fill('wronguser')
        await page.getByTestId('password-input').fill('secret')
        await page.getByRole('button').click()

        await page.getByRole('button', {name: 'view'}).click()

        await expect(page.getByRole('button', {name: 'remove'})).not.toBeVisible()
      })

      describe('and another blog exists', () => {
        beforeEach(async ({ page }) => {
          await page.getByRole('button', {name: 'create new blog'}).click()
          await page.getByTestId('title-input').fill('test blog 2')
          await page.getByTestId('author-input').fill('test blogger')
          await page.getByTestId('url-input').fill('testblog.com')
          await page.getByRole('button', {name: 'create'}).click()
          await page.getByText('test blog 2 test blogger').waitFor()
        })

        test('the blogs are sorted by amount of likes', async ({ page }) => {
          await page.getByRole('button', {name: 'view'}).last().click()
          await page.getByRole('button', {name: 'like'}).click()
          await page.getByRole('button', {name: 'hide'}).click()
  
          const firstBlog = await page.getByRole('button', {name: 'view'}).first().locator('..')
          await expect(firstBlog.getByText('test blog 2 test blogger')).toBeVisible()
        })
      })
    })
  })
})