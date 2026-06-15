# Library Management System Backend

## Prerequisites

- Node.js (v20 or later)
- pnpm
- PostgreSQL

Install pnpm globally if not already installed:

```bash

npm install -g pnpm

```

## Installation

### Clone the Repository

```bash

git clone https://github.com/arjun-aryal/library-management-system-backend.git


```

### Database Setup

Create a PostgreSQL Database

Connect to PostgreSQL and create a database:

CREATE DATABASE library;

### Configure Environment Variables

Rename the sample environment file:

```bash
cp .env.sample .env
```

Update the values in .env as needed:

```bash

PORT=5000

DATABASE_URL=postgresql://postgres:password@localhost:5432/library

JWT_SECRET=your_jwt_secret

DEFAULT_PASSWORD=password123

```

### Run Migrations

Creates all required database tables:

```bash
pnpm migrate
```

### Run Seed Data

Inserts default users, author information, and sample books:

```bash
pnpm seed
```

#### Seeded Users

| Role        | Email                                                 |
| ----------- | ----------------------------------------------------- |
| Super Admin | [admin@example.com](mailto:admin@example.com)         |
| Librarian   | [librarian@example.com](mailto:librarian@example.com) |
| Author      | [author@example.com](mailto:author@example.com)       |

> All seeded users are created with the password defined in the `DEFAULT_PASSWORD` environment variable.

### Install Dependencies

```bash
cd library-management-system-backend

pnpm install

```

### Run Server

```bash

pnpm dev

```

The API will be available at:

```text

http://localhost:5000

```
