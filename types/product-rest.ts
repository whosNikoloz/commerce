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

export interface SummedRestDto {
  id: string;
  finaId: number;
  totalRest: number;
}

export interface FinaProductRestResponse {
  summedRests: SummedRestDto[];
  ex: string;
}
