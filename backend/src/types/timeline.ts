import type { TimelineEventType } from '../constants/timeline.ts';

export type TimelineAuthor = {
  id: number;
  name: string;
};

export type TimelineEntry = {
  id: number;
  eventType: TimelineEventType;
  eventDate: string;
  title: string;
  content: string;
  author: TimelineAuthor;
  createdAt: string;
};
