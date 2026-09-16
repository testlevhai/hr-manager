export type TimelineAuthor = {
  id: number;
  name: string;
};

export type TimelineEntry = {
  id: number;
  eventType: string;
  eventDate: string;
  title: string;
  content: string;
  author: TimelineAuthor;
  createdAt: string;
};

export type TimelineEntryInput = {
  eventType: string;
  eventDate: string;
  title: string;
  content: string;
};
