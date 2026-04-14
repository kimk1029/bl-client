export interface AffiliationAuthor {
  id: number;
  username?: string;
}

export interface AffiliationPostDTO {
  id: number;
  title: string;
  content: string;
  created_at: string;
  views: number;
  affiliation: string | null;
  images: string[] | null;
  author: AffiliationAuthor;
}

export type GetAffiliationPostsResponse = AffiliationPostDTO[];
export type GetAffiliationPostByIdResponse = AffiliationPostDTO;
export type CreateAffiliationPostResponse = AffiliationPostDTO;
export type UpdateAffiliationPostResponse = AffiliationPostDTO;
export type DeleteAffiliationPostResponse = {};

export interface ErrorResponse {
  message: string;
}

export type AffiliationApiResponses = {
  "GET /api/affiliations": GetAffiliationPostsResponse | ErrorResponse;
  "GET /api/affiliations/:id": GetAffiliationPostByIdResponse | ErrorResponse;
  "POST /api/affiliations": CreateAffiliationPostResponse | ErrorResponse;
  "PUT /api/affiliations/:id": UpdateAffiliationPostResponse | ErrorResponse;
  "DELETE /api/affiliations/:id": DeleteAffiliationPostResponse | ErrorResponse;
};


