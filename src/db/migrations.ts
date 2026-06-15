import { pool } from "../config/db";

export const createTables = async () => {
  try {
    // role enum
    await pool.query(`
      do $$ begin
        create type role_enum as enum ('super_admin', 'librarian', 'author');
      exception
        when duplicate_object then null;
      end $$;
    `);

    // users table
    await pool.query(`
      create table if not exists users (
        id serial primary key,
        name varchar(255) not null,
        email varchar(255) unique not null,
        password varchar(500) not null,
        role role_enum not null default 'author',
        is_active boolean not null default true,
        created_at timestamp default current_timestamp,
        updated_at timestamp default current_timestamp
      );
    `);

    // authors table
    await pool.query(`
      create table if not exists authors (
        id serial primary key,
        user_id int unique not null references users(id) on delete cascade,
        bio text,
        nationality varchar(100),
        is_active boolean not null default true,
        created_at timestamp default current_timestamp,
        updated_at timestamp default current_timestamp
      );
    `);

    // books table
    await pool.query(`
      create table if not exists books (
        id serial primary key,
        author_id int not null references authors(id) on delete cascade,
        title varchar(255) not null,
        isbn varchar(50) unique not null,
        published_year int check (published_year >= 0),
        is_active boolean not null default true,
        created_at timestamp default current_timestamp,
        updated_at timestamp default current_timestamp
      );
    `);

    console.log("all tables created successfully");
  } catch (err) {
    console.error("error creating tables:", err);
    throw err;
  } finally {
    pool.end();
  }
};

createTables();
