import { test, expect } from '@playwright/test';

test.describe('Login', () => {
  test('should login successfully with valid credentials', async ({
    page,
  }) => {
    await page.goto('/');

    await page.getByLabel('Email').fill('admin@taskflow.com');
    await page.getByLabel('Password').fill('Admin@123');

    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(
      page.getByRole('heading', { name: 'Projects' })
    ).toBeVisible();
  });

  test('should show error for invalid credentials', async ({
  page,
}) => {
  await page.goto('/');

  await page.getByLabel('Email').fill('admin@taskflow.com');
  await page.getByLabel('Password').fill('WrongPassword');

  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(
    page.getByRole('alert')
  ).toHaveText('Invalid email or password');

  await expect(
    page.getByRole('heading', { name: 'Projects' })
  ).not.toBeVisible();
});

test('should validate required login fields', async ({
  page,
}) => {
  await page.goto('/');

  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(
    page.getByRole('alert')
  ).toHaveText('Email and password are required');
});
});