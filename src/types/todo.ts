export interface Todo {
  _id: string;
  text: string;
  completed: boolean;
  createdAt: string; // Changed from Date to string for API communication
}
