import { SQLiteDatabase } from 'expo-sqlite';

export async function getUserSetting(db: SQLiteDatabase, key: string): Promise<string | null> {
  const row = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM user_settings WHERE key = ?',
    key
  );
  return row?.value ?? null;
}

export async function setUserSetting(
  db: SQLiteDatabase,
  key: string,
  value: string | null
): Promise<void> {
  if (value === null) {
    await db.runAsync('DELETE FROM user_settings WHERE key = ?', key);
  } else {
    await db.runAsync(
      'INSERT INTO user_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
      key,
      value
    );
  }
}
