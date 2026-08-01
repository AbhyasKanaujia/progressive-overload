import { getDatabase, resetDatabase } from './init';
import { getUserSetting, setUserSetting } from './settings';

jest.mock('expo-sqlite');

describe('settings CRUD', () => {
  let db: Awaited<ReturnType<typeof getDatabase>>;

  beforeEach(async () => {
    resetDatabase();
    db = await getDatabase();
  });

  it('returns null for missing key', async () => {
    const value = await getUserSetting(db, 'missing');
    expect(value).toBeNull();
  });

  it('stores and retrieves a string value', async () => {
    await setUserSetting(db, 'foo', 'bar');
    const value = await getUserSetting(db, 'foo');
    expect(value).toBe('bar');
  });

  it('updates an existing value', async () => {
    await setUserSetting(db, 'foo', 'bar');
    await setUserSetting(db, 'foo', 'baz');
    const value = await getUserSetting(db, 'foo');
    expect(value).toBe('baz');
  });

  it('deletes a value when set to null', async () => {
    await setUserSetting(db, 'foo', 'bar');
    await setUserSetting(db, 'foo', null);
    const value = await getUserSetting(db, 'foo');
    expect(value).toBeNull();
  });
});
