/**
 * A single TODO item as returned by the API.
 * The shape mirrors the backend TodoResponse DTO.
 */
export interface Todo {
  readonly id: string;
  readonly title: string;
  readonly createdAt: string; // ISO 8601 string, parsed by clients as needed.
}
