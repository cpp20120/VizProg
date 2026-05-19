import { describe, expect, it } from 'vitest';
import { mockApi } from '@shared/api/mockApi';

describe('mockApi auth tokens', () => {
  it('allows dashboard document fetch immediately after login', async () => {
    const session = await mockApi.login('demo@example.com', 'password123');
    const documents = await mockApi.listDocuments(session.accessToken);
    expect(documents.length).toBeGreaterThan(0);
  });

  it('allows document operations immediately after register', async () => {
    const session = await mockApi.register('New User', `new-${crypto.randomUUID()}@example.com`, 'password123');
    const document = await mockApi.createDocument(session.accessToken, { name: 'Registered user doc', rows: 10, columns: 5 });
    const documents = await mockApi.listDocuments(session.accessToken);
    expect(documents.some((item) => item.id === document.id)).toBe(true);
  });
});
