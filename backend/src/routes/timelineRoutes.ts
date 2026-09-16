import { Router } from 'express';
import { ROUTE } from '../constants/routes.ts';
import {
  employeeIdRouteParamSchema,
  timelineEntryInputSchema,
  timelineListQuerySchema,
} from '../schemas/timelineSchemas.ts';
import { addTimelineEntry, getEmployeeTimeline } from '../services/timelineService.ts';

export const timelineRoutes = Router({ mergeParams: true });

timelineRoutes.get(ROUTE.ROOT, async (req, res) => {
  const { employeeId } = employeeIdRouteParamSchema.parse(req.params);
  const query = timelineListQuerySchema.parse(req.query);

  const result = await getEmployeeTimeline(employeeId, query);
  res.status(200).json(result);
});

timelineRoutes.post(ROUTE.ROOT, async (req, res) => {
  const { employeeId } = employeeIdRouteParamSchema.parse(req.params);
  const body = timelineEntryInputSchema.parse(req.body);
  req.body = body;

  const entry = await addTimelineEntry(employeeId, req.authUser.id, body);
  res.status(201).json(entry);
});
