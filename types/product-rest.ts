export type FinaProductRestArrayModel = {
  prods: string[];
};

export interface FinaProductRestModel {
  id: number;
  store: number;
  rest: number;
  reserve: number;
  guidId?: string | null;
}
