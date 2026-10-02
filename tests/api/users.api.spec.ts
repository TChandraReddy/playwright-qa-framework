import { test, expect } from '@playwright/test';

/**
 * API layer against a public REST fixture (reqres.in), kept separate from
 * the UI suite so it can run on its own in CI (faster, no browser needed)
 * and demonstrates contract/schema checks rather than just status codes.
 */
const API_BASE = 'https://reqres.in/api';

test.describe('Users API', () => {
  test('GET /users returns a schema-valid, paginated list', { tag: ['@smoke'] }, async ({ request }) => {
    const response = await request.get(`${API_BASE}/users?page=2`);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.page).toBe(2);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThan(0);

    for (const user of body.data) {
      expect(user).toEqual(
        expect.objectContaining({
          id: expect.any(Number),
          email: expect.stringContaining('@'),
          first_name: expect.any(String),
          last_name: expect.any(String),
        })
      );
    }
  });

  test(
    'GET /users/:id 404s for a user that does not exist',
    { tag: ['@regression'] },
    async ({ request }) => {
      const response = await request.get(`${API_BASE}/users/999`);
      expect(response.status()).toBe(404);
    }
  );

  test('full CRUD lifecycle against a single resource', { tag: ['@regression'] }, async ({ request }) => {
    const created = await request.post(`${API_BASE}/users`, {
      data: { name: 'Chandra Reddy', job: 'QA Automation Consultant' },
    });
    expect(created.status()).toBe(201);
    const createdBody = await created.json();
    expect(createdBody).toEqual(
      expect.objectContaining({ name: 'Chandra Reddy', job: 'QA Automation Consultant' })
    );
    expect(createdBody.id).toBeTruthy();
    expect(createdBody.createdAt).toBeTruthy();

    const updated = await request.put(`${API_BASE}/users/2`, {
      data: { name: 'Chandra Reddy', job: 'Senior QA Manager' },
    });
    expect(updated.status()).toBe(200);
    const updatedBody = await updated.json();
    expect(updatedBody.job).toBe('Senior QA Manager');
    expect(updatedBody.updatedAt).toBeTruthy();

    const deleted = await request.delete(`${API_BASE}/users/2`);
    expect(deleted.status()).toBe(204);
  });
});
