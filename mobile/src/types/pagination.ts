export type Paginated<TItem> = {
  items: TItem[];
  page: number;
  pageSize: number;
  total: number;
};
