import { PrismaClient, TodoCategory, Priority, Status } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clean the database
  await prisma.todo.deleteMany();

  // Create sample todos
  const sampleTodos = [
    {
      title: 'Complete Project Proposal',
      content: 'Write and submit the project proposal for the new client',
      category: TodoCategory.WORK,
      priority: Priority.HIGH,
      status: Status.NOT_STARTED,
      url: 'https://example.com/project-docs'
    },
    {
      title: 'Grocery Shopping',
      content: 'Buy groceries for the week: fruits, vegetables, and milk',
      category: TodoCategory.SHOPPING,
      priority: Priority.MEDIUM,
      status: Status.NOT_STARTED,
      url: ''
    },
    {
      title: 'Exercise',
      content: '30 minutes of cardio and strength training',
      category: TodoCategory.PERSONAL,
      priority: Priority.LOW,
      status: Status.NOT_STARTED,
      url: 'https://example.com/workout-plan'
    }
  ];

  for (const todo of sampleTodos) {
    await prisma.todo.create({
      data: todo,
    });
  }

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
