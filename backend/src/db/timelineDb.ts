import { pool } from './pool.ts';
import type { TimelineEntry } from '../types/timeline.ts';
import type { TimelineEntryInput, TimelineListQuery } from '../schemas/timelineSchemas.ts';

const TIMELINE_ENTRY_SELECT = `
  SELECT
    t.id,
    t.event_type AS "eventType",
    to_char(t.event_date, 'YYYY-MM-DD') AS "eventDate",
    t.title,
    t.content,
    json_build_object('id', u.id, 'name', u.name) AS author,
    to_char(t.created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS "createdAt"
  FROM timeline_entries t
  JOIN users u ON u.id = t.author_user_id
`;

export const listTimelineEntries = async (
  employeeId: number,
  query: TimelineListQuery,
): Promise<{ items: TimelineEntry[]; total: number }> => {
  const countResult = await pool.query<{ total: string }>(
    'SELECT count(*) AS total FROM timeline_entries WHERE employee_id = $1',
    [employeeId],
  );

  const itemsResult = await pool.query<TimelineEntry>(
    `${TIMELINE_ENTRY_SELECT}
     WHERE t.employee_id = $1
     ORDER BY t.event_date DESC, t.id DESC
     LIMIT $2 OFFSET $3`,
    [employeeId, query.pageSize, (query.page - 1) * query.pageSize],
  );

  return { items: itemsResult.rows, total: Number(countResult.rows[0]!.total) };
};

export const getTimelineEntryById = async (entryId: number): Promise<TimelineEntry | null> => {
  const result = await pool.query<TimelineEntry>(`${TIMELINE_ENTRY_SELECT} WHERE t.id = $1`, [
    entryId,
  ]);
  return result.rows[0] ?? null;
};

export const insertTimelineEntry = async (
  employeeId: number,
  authorUserId: number,
  input: TimelineEntryInput,
): Promise<number> => {
  const result = await pool.query<{ id: number }>(
    `INSERT INTO timeline_entries (employee_id, author_user_id, event_type, event_date, title, content)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id`,
    [employeeId, authorUserId, input.eventType, input.eventDate, input.title, input.content],
  );

  return result.rows[0]!.id;
};
