// Lu par drizzle-kit pour générer les migrations : ce fichier n'importe que drizzle-orm.
import { integer, pgTable, varchar } from 'drizzle-orm/pg-core';

export const nations = pgTable('nations', {
  code: varchar('code', { length: 2 }).primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  // Le continent est vérifié par le schéma partagé à la lecture (mapper).
  continent: varchar('continent', { length: 20 }).notNull(),
  // Le tableau publié par la source : il sert à signaler les écarts, pas à classer.
  announcedGold: integer('announced_gold').notNull().default(0),
  announcedSilver: integer('announced_silver').notNull().default(0),
  announcedBronze: integer('announced_bronze').notNull().default(0),
});

export type NationRow = typeof nations.$inferSelect;
