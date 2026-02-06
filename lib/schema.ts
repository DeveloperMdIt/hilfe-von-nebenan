import { pgTable, uuid, text, varchar, integer, boolean, timestamp } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const users = pgTable('users', {
    id: uuid('id').defaultRandom().primaryKey(),
    email: text('email').notNull().unique(),
    fullName: text('full_name'),
    role: varchar('role', { length: 20 }).default('customer'),
    password: text('password'), // Nullable for now
    trustLevel: integer('trust_level').default(0),
    isVerified: boolean('is_verified').default(false),
    isHelperBadge: boolean('is_helper_badge').default(false),
    planId: uuid('plan_id'),
    subscriptionExpiresAt: timestamp('subscription_expires_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const reviews = pgTable('reviews', {
    id: uuid('id').defaultRandom().primaryKey(),
    taskId: uuid('task_id').references(() => tasks.id),
    reviewerId: uuid('reviewer_id').references(() => users.id).notNull(),
    revieweeId: uuid('reviewee_id').references(() => users.id).notNull(),
    rating: integer('rating').notNull(), // 1-5
    comment: text('comment'),
    type: varchar('type', { length: 20 }).notNull(), // 'helper' (rating the helper) or 'seeker' (rating the seeker)
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const tasks = pgTable('tasks', {
    id: uuid('id').defaultRandom().primaryKey(),
    customerId: uuid('customer_id').references(() => users.id),
    helperId: uuid('helper_id').references(() => users.id),
    title: text('title').notNull(),
    description: text('description').notNull(),
    category: varchar('category', { length: 50 }),
    status: varchar('status', { length: 20 }).default('open'),
    priceCents: integer('price_cents').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const settings = pgTable('settings', {
    key: varchar('key', { length: 50 }).primaryKey(),
    value: text('value'),
});

export const emailTemplates = pgTable('email_templates', {
    id: uuid('id').defaultRandom().primaryKey(),
    key: varchar('key', { length: 50 }).notNull().unique(), // e.g., 'welcome_mail'
    subject: text('subject').notNull(),
    body: text('body').notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const messages = pgTable('messages', {
    id: uuid('id').defaultRandom().primaryKey(),
    senderId: uuid('sender_id').references(() => users.id).notNull(),
    receiverId: uuid('receiver_id').references(() => users.id).notNull(),
    content: text('content').notNull(),
    isRead: boolean('is_read').default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const subscriptionPlans = pgTable('subscription_plans', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 50 }).notNull(), // 'Basic', 'Pro'
    priceMonthlyCents: integer('price_monthly_cents').notNull(), // 299 for Pro
    priceYearlyCents: integer('price_yearly_cents'), // 2999 for Pro
    commissionRate: integer('commission_rate').notNull(), // 15 for Basic, 10 for Pro
    features: text('features'), // JSON string or simple text description
    isActive: boolean('is_active').default(true),
});
