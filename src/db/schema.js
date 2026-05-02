import { pgTable, pgEnum, serial, varchar, timestamp, integer, jsonb, text } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enum for match status
export const matchStatusEnum = pgEnum('match_status', ['scheduled', 'live', 'finished']);

// Matches table
export const matches = pgTable('matches', {
  id: serial('id').primaryKey(),
  sport: varchar('sport', { length: 50 }).notNull(),
  homeTeam: varchar('home_team', { length: 100 }).notNull(),
  awayTeam: varchar('away_team', { length: 100 }).notNull(),
  status: matchStatusEnum('status').notNull().default('scheduled'),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time'),
  homeScore: integer('home_score').notNull().default(0),
  awayScore: integer('away_score').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Commentary table
export const commentary = pgTable('commentary', {
  id: serial('id').primaryKey(),
  matchId: integer('match_id')
    .notNull()
    .references(() => matches.id, { onDelete: 'cascade' }),
  minute: integer('minute'),
  sequence: integer('sequence'),
  period: varchar('period', { length: 50 }),
  eventType: varchar('event_type', { length: 100 }).notNull(),
  actor: varchar('actor', { length: 100 }),
  team: varchar('team', { length: 100 }),
  message: text('message').notNull(),
  metadata: jsonb('metadata'),
  tags: text('tags'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Relations
export const matchesRelations = relations(matches, ({ many }) => ({
  commentary: many(commentary),
}));

export const commentaryRelations = relations(commentary, ({ one }) => ({
  match: one(matches, {
    fields: [commentary.matchId],
    references: [matches.id],
  }),
}));
