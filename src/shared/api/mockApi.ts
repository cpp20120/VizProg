import { apiError } from '@shared/api/errors';
import type { DocumentSummary, SpreadsheetDocument, User } from '@shared/types/domain';
import { cellId } from '@shared/utils/cellAddress';
import { nowIso } from '@shared/utils/date';
import { inferCellType, makeCell } from '@features/spreadsheet/spreadsheetModel';

export type AuthResponse = {
  user: User;
  accessToken: string;
  refreshToken: string;
};

export type CreateDocumentInput = {
  name: string;
  rows: number;
  columns: number;
};

export type RenameDocumentInput = {
  id: string;
  name: string;
};

type StoredUser = User & { password: string };
type MockApiSnapshot = {
  users: StoredUser[];
  documents: SpreadsheetDocument[];
  refreshTokens: [string, string][];
};

const latency = 20;
const storageKey = 'spreadsheet_mock_api_snapshot_v1';

const wait = async (): Promise<void> => {
  await new Promise((resolve) => window.setTimeout(resolve, latency));
};

const makeToken = (kind: 'access' | 'refresh', userId: string): string =>
  `${kind}:${encodeURIComponent(userId)}:${crypto.randomUUID()}`;

const clone = <T>(value: T): T => structuredClone(value);

const storage = (): Storage | null => {
  if (typeof window === 'undefined') return null;
  return typeof window.localStorage.getItem === 'function' ? window.localStorage : null;
};

const demoCreatedAt = '2026-05-19T00:00:00.000Z';

const users = new Map<string, StoredUser>([
  [
    'user-1',
    {
      id: 'user-1',
      name: 'Demo User',
      email: 'demo@example.com',
      password: 'password123',
      createdAt: demoCreatedAt,
    },
  ],
  [
    'user-2',
    {
      id: 'user-2',
      name: 'Other User',
      email: 'other@example.com',
      password: 'password123',
      createdAt: demoCreatedAt,
    },
  ],
]);

const refreshTokens = new Map<string, string>();
const accessTokens = new Map<string, string>();
const documents = new Map<string, SpreadsheetDocument>();

const persistSnapshot = (): void => {
  storage()?.setItem(
    storageKey,
    JSON.stringify({
      users: [...users.values()],
      documents: [...documents.values()],
      refreshTokens: [...refreshTokens.entries()],
    } satisfies MockApiSnapshot),
  );
};

const createInitialDocument = (
  ownerId: string,
  name: string,
  rows: number,
  columns: number,
  values: Record<string, string>,
): SpreadsheetDocument => {
  const id = crypto.randomUUID();
  const createdAt = nowIso();
  const cells: SpreadsheetDocument['cells'] = {};
  Object.entries(values).forEach(([key, rawValue]) => {
    const address = /^([A-Z]+)([1-9]\d*)$/.test(key)
      ? { row: Number(key.replace(/^[A-Z]+/, '')) - 1, column: key.charCodeAt(0) - 65 }
      : null;
    if (address) cells[key] = makeCell(rawValue, inferCellType(rawValue));
  });
  const document = {
    id,
    ownerId,
    name,
    createdAt,
    updatedAt: createdAt,
    rows,
    columns,
    cells,
    rowHeights: {},
    columnWidths: {},
  };
  documents.set(id, document);
  return document;
};

createInitialDocument('user-1', 'Бюджет проекта', 1000, 26, {
  A1: 'Доход',
  A2: '1200',
  A3: '800',
  B1: '=SUM(A2:A3)',
});
createInitialDocument('user-1', 'План задач', 100, 26, { A1: 'Задача', B1: 'Готово', B2: 'true' });
createInitialDocument('user-2', 'Чужой документ', 100, 26, { A1: 'private' });

const restoreSnapshot = (): boolean => {
  const raw = storage()?.getItem(storageKey);
  if (!raw) return false;
  try {
    const snapshot = JSON.parse(raw) as Partial<MockApiSnapshot>;
    if (!Array.isArray(snapshot.users) || !Array.isArray(snapshot.documents)) return false;
    users.clear();
    documents.clear();
    refreshTokens.clear();
    snapshot.users.forEach((user) => users.set(user.id, user));
    snapshot.documents.forEach((document) => documents.set(document.id, document));
    snapshot.refreshTokens?.forEach(([token, userId]) => refreshTokens.set(token, userId));
    return true;
  } catch {
    return false;
  }
};

if (!restoreSnapshot()) persistSnapshot();

const publicUser = (user: StoredUser): User => ({
  id: user.id,
  name: user.name,
  email: user.email,
  createdAt: user.createdAt,
});

const userIdFromAccessToken = (accessToken: string | null): string => {
  if (!accessToken) throw apiError('UNAUTHORIZED', 'Требуется вход', 401);
  const userId = accessTokens.get(accessToken);
  if (!userId || !users.has(userId)) throw apiError('UNAUTHORIZED', 'Сессия истекла', 401);
  return userId;
};

const userIdFromRefreshToken = (refreshToken: string): string | null => {
  const mapped = refreshTokens.get(refreshToken);
  if (mapped) return mapped;
  const match = /^refresh:([^:]+):[0-9a-f-]+$/i.exec(refreshToken);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
};

const createAuthResponse = (user: StoredUser): AuthResponse => {
  const accessToken = makeToken('access', user.id);
  const refreshToken = makeToken('refresh', user.id);
  accessTokens.set(accessToken, user.id);
  refreshTokens.set(refreshToken, user.id);
  persistSnapshot();
  return { user: publicUser(user), accessToken, refreshToken };
};

const summarize = (document: SpreadsheetDocument): DocumentSummary => {
  const preview: string[][] = [];
  for (let row = 0; row < Math.min(3, document.rows); row += 1) {
    const cells: string[] = [];
    for (let column = 0; column < Math.min(3, document.columns); column += 1) {
      cells.push(document.cells[cellId({ row, column })]?.rawValue ?? '');
    }
    preview.push(cells);
  }
  return {
    id: document.id,
    ownerId: document.ownerId,
    name: document.name,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
    rows: document.rows,
    columns: document.columns,
    preview,
  };
};

const requireOwnedDocument = (id: string, accessToken: string | null): SpreadsheetDocument => {
  const userId = userIdFromAccessToken(accessToken);
  const document = documents.get(id);
  if (!document) throw apiError('NOT_FOUND', 'Документ не найден', 404);
  if (document.ownerId !== userId) throw apiError('FORBIDDEN', 'Нет доступа к документу', 403);
  return document;
};

export const mockApi = {
  async login(email: string, password: string): Promise<AuthResponse> {
    await wait();
    const user = [...users.values()].find((candidate) => candidate.email === email);
    if (user?.password !== password) throw apiError('UNAUTHORIZED', 'Неверный email или пароль', 401);
    return createAuthResponse(user);
  },

  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    await wait();
    if ([...users.values()].some((user) => user.email === email)) {
      throw apiError('VALIDATION', 'Email уже используется', 400);
    }
    const id = crypto.randomUUID();
    const user: StoredUser = { id, name, email, password, createdAt: nowIso() };
    users.set(id, user);
    persistSnapshot();
    return createAuthResponse(user);
  },

  async refresh(refreshToken: string | null): Promise<{ accessToken: string; user: User }> {
    await wait();
    if (!refreshToken) throw apiError('UNAUTHORIZED', 'Refresh token отсутствует', 401);
    const userId = userIdFromRefreshToken(refreshToken);
    const user = userId ? users.get(userId) : undefined;
    if (!user) throw apiError('UNAUTHORIZED', 'Refresh token недействителен', 401);
    refreshTokens.set(refreshToken, user.id);
    const accessToken = makeToken('access', user.id);
    accessTokens.set(accessToken, user.id);
    persistSnapshot();
    return { accessToken, user: publicUser(user) };
  },

  async logout(refreshToken: string | null): Promise<void> {
    await wait();
    if (refreshToken) {
      refreshTokens.delete(refreshToken);
      persistSnapshot();
    }
  },

  async updateProfile(accessToken: string | null, name: string): Promise<User> {
    await wait();
    const userId = userIdFromAccessToken(accessToken);
    const user = users.get(userId);
    if (!user) throw apiError('UNAUTHORIZED', 'Пользователь не найден', 401);
    user.name = name;
    persistSnapshot();
    return publicUser(user);
  },

  async changePassword(accessToken: string | null, password: string): Promise<void> {
    await wait();
    const user = users.get(userIdFromAccessToken(accessToken));
    if (user) {
      user.password = password;
      persistSnapshot();
    }
  },

  async listDocuments(accessToken: string | null): Promise<DocumentSummary[]> {
    await wait();
    const userId = userIdFromAccessToken(accessToken);
    return [...documents.values()]
      .filter((document) => document.ownerId === userId)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .map(summarize);
  },

  async getDocument(accessToken: string | null, id: string): Promise<SpreadsheetDocument> {
    await wait();
    return clone(requireOwnedDocument(id, accessToken));
  },

  async createDocument(accessToken: string | null, input: CreateDocumentInput): Promise<SpreadsheetDocument> {
    await wait();
    const ownerId = userIdFromAccessToken(accessToken);
    const createdAt = nowIso();
    const document: SpreadsheetDocument = {
      id: crypto.randomUUID(),
      ownerId,
      name: input.name,
      createdAt,
      updatedAt: createdAt,
      rows: Math.max(1, input.rows),
      columns: Math.max(1, input.columns),
      cells: {},
      rowHeights: {},
      columnWidths: {},
    };
    documents.set(document.id, document);
    persistSnapshot();
    return clone(document);
  },

  async renameDocument(accessToken: string | null, input: RenameDocumentInput): Promise<DocumentSummary> {
    await wait();
    const document = requireOwnedDocument(input.id, accessToken);
    document.name = input.name;
    document.updatedAt = nowIso();
    persistSnapshot();
    return summarize(document);
  },

  async duplicateDocument(accessToken: string | null, id: string): Promise<SpreadsheetDocument> {
    await wait();
    const source = requireOwnedDocument(id, accessToken);
    const now = nowIso();
    const document: SpreadsheetDocument = {
      ...clone(source),
      id: crypto.randomUUID(),
      name: `${source.name} копия`,
      createdAt: now,
      updatedAt: now,
    };
    documents.set(document.id, document);
    persistSnapshot();
    return clone(document);
  },

  async deleteDocument(accessToken: string | null, id: string): Promise<string> {
    await wait();
    requireOwnedDocument(id, accessToken);
    documents.delete(id);
    persistSnapshot();
    return id;
  },

  async saveDocument(accessToken: string | null, document: SpreadsheetDocument): Promise<SpreadsheetDocument> {
    await wait();
    requireOwnedDocument(document.id, accessToken);
    const saved = { ...clone(document), updatedAt: nowIso() };
    documents.set(saved.id, saved);
    persistSnapshot();
    return clone(saved);
  },
};
