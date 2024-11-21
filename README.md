# Advanced Todo App with Next.js and PostgreSQL

A modern, feature-rich todo application built with Next.js 14, PostgreSQL, and Prisma.

## Features
- Create, read, update, and delete todos
- Rich text editing with TipTap
- Advanced filtering by category, priority, and status
- Smart pagination with client-side navigation
- URL field support for todos
- Modern UI with Tailwind CSS
- Full-text search capabilities
- Responsive design
- Accessibility features

## Tech Stack
- Next.js 14 (App Router)
- React
- PostgreSQL (Vercel Postgres)
- Prisma ORM
- TipTap Rich Text Editor
- Tailwind CSS
- TypeScript

## Getting Started

1. Clone the repository:
```bash
git clone [your-repo-url]
cd todo-app-pg
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory and add your database URL:
```
DATABASE_URL="your-postgresql-url"
```

4. Run Prisma migrations:
```bash
npx prisma generate
npx prisma db push
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Key Features

### Rich Text Editing
- Format text with bold, italic, and underline
- Change text color
- Multiple paragraph support

### Advanced Filtering
- Filter by category (Work, Personal, Shopping, etc.)
- Filter by priority (High, Medium, Low)
- Filter by status (Not Started, In Progress, Completed)

### Smart Pagination
- Client-side navigation
- First/Last page buttons
- Previous/Next navigation
- Dynamic page number display
- Accessibility support

### URL Support
- Add URLs to todos
- Clickable links in todo list
- URL validation

## Development

The project uses:
- ESLint for code linting
- Prettier for code formatting
- TypeScript for type safety
- Prisma for database management

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
