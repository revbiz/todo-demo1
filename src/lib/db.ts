import { MongoClient, ObjectId } from 'mongodb';
import { Todo } from '@/types/todo';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your MongoDB URI to .env.local');
}

const uri = process.env.MONGODB_URI;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export { clientPromise };

export async function getAllTodos(): Promise<Todo[]> {
  const client = await clientPromise;
  const collection = client.db('todo-app').collection('todos');
  const todos = await collection.find({}).toArray();
  return todos.map(todo => ({
    ...todo,
    _id: todo._id.toString()
  }));
}

export async function addTodo(todo: Todo): Promise<void> {
  const client = await clientPromise;
  const collection = client.db('todo-app').collection('todos');
  await collection.insertOne({
    ...todo,
    _id: new ObjectId(todo._id)
  });
}

export async function updateTodo(
  id: string,
  updates: { completed?: boolean; text?: string }
): Promise<void> {
  const client = await clientPromise;
  const collection = client.db('todo-app').collection('todos');
  await collection.updateOne(
    { _id: new ObjectId(id) },
    { $set: updates }
  );
}

export async function deleteTodo(id: string): Promise<void> {
  const client = await clientPromise;
  const collection = client.db('todo-app').collection('todos');
  await collection.deleteOne({ _id: new ObjectId(id) });
}
