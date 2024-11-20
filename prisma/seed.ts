import { PrismaClient, TodoCategory } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clean the database
  await prisma.todo.deleteMany();

  // Create sample todos
  const sampleTodos = [
    {
      title: 'Team Meeting',
      content: 'Discuss project roadmap and upcoming features',
      category: 'Event' as TodoCategory,
    },
    {
      title: 'Buy Groceries',
      content: 'Milk, eggs, bread, and vegetables',
      category: 'Reminder' as TodoCategory,
    },
    {
      title: 'Learn GraphQL',
      content: 'Study GraphQL basics and implement a sample project',
      category: 'Someday' as TodoCategory,
    },
    {
      title: 'Fix Navigation Bug',
      content: 'Debug and fix the navigation issue in the mobile view',
      category: 'Now' as TodoCategory,
    },
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
