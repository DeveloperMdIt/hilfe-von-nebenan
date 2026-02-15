import { pgTable, uuid, text, varchar, integer, boolean, timestamp, doublePrecision } from 'drizzle-orm/pg-core';
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
    // Consent & Legal
    acceptedTermsAt: timestamp('accepted_terms_at', { withTimezone: true }),
    acceptedPrivacyAt: timestamp('accepted_privacy_at', { withTimezone: true }),
    termsVersion: varchar('terms_version', { length: 20 }),
    ipAddress: varchar('ip_address', { length: 45 }), // IPv6 support
    bio: text('bio'), // "Was der User bereit ist zu machen" / Skillset
    zipCode: varchar('zip_code', { length: 10 }), // For PLZ-based waiting list thresholds
    verificationToken: text('verification_token'),
    emailVerifiedAt: timestamp('email_verified_at', { withTimezone: true }),
    // Password Reset
    resetPasswordToken: text('reset_password_token'),
    resetPasswordExpiresAt: timestamp('reset_password_expires_at', { withTimezone: true }),
    isActive: boolean('is_active').default(true),
    lastSeenAt: timestamp('last_seen_at', { withTimezone: true }),
    psttgLastWarningYear: integer('psttg_last_warning_year'),
    // PStTG Mandatory Data
    street: text('street'),
    houseNumber: varchar('house_number', { length: 20 }),
    city: varchar('city', { length: 100 }),
    country: varchar('country', { length: 100 }).default('Deutschland'),
    dateOfBirth: timestamp('date_of_birth', { withTimezone: true }),
    taxId: varchar('tax_id', { length: 50 }),
    iban: varchar('iban', { length: 50 }),
    bic: varchar('bic', { length: 20 }),
    accountHolderName: text('account_holder_name'),
    stripeAccountId: varchar('stripe_account_id', { length: 255 }),
});

export const archivedConversations = pgTable('archived_conversations', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').references(() => users.id).notNull(),
    partnerId: uuid('partner_id').references(() => users.id).notNull(),
    taskId: uuid('task_id').references(() => tasks.id), // Nullable for general chats
    archivedAt: timestamp('archived_at', { withTimezone: true }).defaultNow(),
});

export const zipCodeActivations = pgTable('zip_code_activations', {
    zipCode: varchar('zip_code', { length: 10 }).primaryKey(),
    activatedAt: timestamp('activated_at', { withTimezone: true }).defaultNow(),
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
    status: varchar('status', { length: 50 }).default('open'), // 'open', 'assigned', 'completed_by_helper', 'completed_by_seeker', 'closed'
    priceCents: integer('price_cents').notNull(),
    commissionCents: integer('commission_cents'),
    payoutCents: integer('payout_cents'),
    stripePaymentIntentId: varchar('stripe_payment_intent_id', { length: 255 }),
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
    taskId: uuid('task_id').references(() => tasks.id), // New: messages are now task-based
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

export const tags = pgTable('tags', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 100 }).notNull().unique(),
    category: varchar('category', { length: 50 }).notNull(), // 'Interesse', 'Skill', etc.
    isApproved: boolean('is_approved').default(false),
    suggestedById: uuid('suggested_by_id').references(() => users.id),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const userTags = pgTable('user_tags', {
    userId: uuid('user_id').references(() => users.id).notNull(),
    tagId: uuid('tag_id').references(() => tags.id).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
    pk: sql`PRIMARY KEY (${table.userId}, ${table.tagId})`,
}));

export const zipCoordinates = pgTable('zip_coordinates', {
    zipCode: varchar('zip_code', { length: 10 }).primaryKey(),
    latitude: doublePrecision('latitude').notNull(),
    longitude: doublePrecision('longitude').notNull(),
});
