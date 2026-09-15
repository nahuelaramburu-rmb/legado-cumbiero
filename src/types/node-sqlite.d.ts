// Minimal ambient types for Node's built-in experimental `node:sqlite` module
// (Node 22+). Only the surface this project uses is declared.
declare module "node:sqlite" {
  export type SQLInputValue = string | number | bigint | Buffer | null;

  export class StatementSync {
    run(...params: SQLInputValue[]): { changes: number; lastInsertRowid: number | bigint };
    get(...params: SQLInputValue[]): Record<string, unknown> | undefined;
    all(...params: SQLInputValue[]): Record<string, unknown>[];
  }

  export class DatabaseSync {
    constructor(location: string, options?: { open?: boolean });
    exec(sql: string): void;
    prepare(sql: string): StatementSync;
    close(): void;
  }
}
