import { pool } from './pool.ts';
import type { AuthUser } from '../types/auth.ts';

export const upsertUserByGoogleSub = async (
  googleSub: string,
  email: string,
  name: string,
): Promise<AuthUser> => {
  const result = await pool.query<AuthUser>(
    `INSERT INTO users (google_sub, email, name)
     VALUES ($1, $2, $3)
     ON CONFLICT (google_sub) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name
     RETURNING id, email, name`,
    [googleSub, email, name],
  );

  return result.rows[0]!;
};
