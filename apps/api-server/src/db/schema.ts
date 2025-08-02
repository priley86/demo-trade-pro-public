import { pgTable, uuid, varchar, text, numeric, timestamp, integer, pgEnum } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey(), // Auth0 user ID (sub claim)
  email: text('email'),
  cashBalance: numeric('cash_balance', { precision: 12, scale: 2 }).notNull().default('10000.00'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

export const companies = pgTable('companies', {
  id: uuid('id').primaryKey().defaultRandom(),
  symbol: varchar('symbol', { length: 10 }).unique().notNull(),
  name: text('name').notNull()
});

export const quotes = pgTable('quotes', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').references(() => companies.id).notNull(),
  price: numeric('price', { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

export const sideEnum = pgEnum('order_side', ['BUY', 'SELL']);
export const statusEnum = pgEnum('order_status', ['PENDING', 'FILLED', 'REJECTED']);

export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').references(() => companies.id).notNull(),
  userId: text('user_id').references(() => users.id).notNull(),
  side: sideEnum('side').notNull(),
  quantity: integer('quantity').notNull(),
  price: numeric('price', { precision: 12, scale: 2 }).notNull(),
  status: statusEnum('status').notNull().default('PENDING'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});
