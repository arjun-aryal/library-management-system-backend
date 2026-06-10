import { Pool, PoolClient, QueryResult, QueryResultRow } from "pg";
import { env } from "./env";

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
});

export const query = async <T extends QueryResultRow>(
  text: string,
  params?: unknown[],
  client: Pool | PoolClient = pool,
): Promise<QueryResult<T>> => {
  return client.query<T>(text, params);
};
