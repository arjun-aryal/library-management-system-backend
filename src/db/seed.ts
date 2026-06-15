import { pool, query } from "config/db";

import { defaultPassword } from "utils";

const seeder = async () => {
  try {
    const password = await defaultPassword();

    // super_admin
    await query(
      `
        insert into users ( name, email,password,role)
        values ($1,$2,$3,$4)
        
        `,
      ["Super Admin", "admin@example.com", password, "super_admin"],
    );
    // librarian
    await query(
      `
        insert into users ( name, email,password,role)
        values ($1,$2,$3,$4)
        
        `,
      ["Librarian User", "librarian@example.com", password, "librarian"],
    );

    // author
    const authorUser = await query(
      `
        insert into users ( name, email,password,role)
        values ($1,$2,$3,$4)
        returning id

        
        `,
      ["Author User", "author@example.com", password, "author"],
    );

    const userId = authorUser.rows[0].id;

    const authorInfo = await query(
      `
        insert into authors (user_id, bio, nationality)
        values ($1,$2,$3)
        on conflict (user_id) do nothing
        returning id
        `,
      [userId, "Seed Bio", "Seed Nationality"],
    );
    const authorId = authorInfo.rows[0].id;

    // books
    await query(
      `
        insert into books (
          author_id,
          title,
          isbn,
          published_year
        )
        values
          ($1, 'Harry Potter and the Philosopher''s Stone', '9780747532699', 1997),
          ($1, 'Harry Potter and the Chamber of Secrets', '9780747538493', 1998),
          ($1, 'Harry Potter and the Prisoner of Azkaban', '9780747542155', 1999),
          ($1, 'Harry Potter and the Goblet of Fire', '9780747546245', 2000)
        `,
      [authorId],
    );

    console.log("Seed completed successfully");
  } catch (error) {
    console.error(error);
  } finally {
    pool.end();
  }
};

seeder();
