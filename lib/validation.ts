import { z } from 'zod';

export const loginSchema = z.object({
    email: z.string().email('Ungültige E-Mail-Adresse'),
    password: z.string().min(1, 'Passwort erforderlich'),
});

export const registerSchema = z.object({
    name: z.string().min(2, 'Name muss mindestens 2 Zeichen lang sein'),
    email: z.string().email('Ungültige E-Mail-Adresse'),
    zipCode: z.string().regex(/^\d{5}$/, 'PLZ muss 5 Ziffern haben'),
    password: z.string()
        .min(8, 'Passwort muss mindestens 8 Zeichen lang sein')
        .regex(/[A-Z]/, 'Passwort muss einen Großbuchstaben enthalten')
        .regex(/[0-9]/, 'Passwort muss eine Zahl enthalten')
        .regex(/[^A-Za-z0-9]/, 'Passwort muss ein Sonderzeichen enthalten'),
    consent: z.string().optional(), // Checkbox value usually "on" or undefined
});

export const createTaskSchema = z.object({
    title: z.string().min(5, 'Titel muss mindestens 5 Zeichen lang sein').max(100),
    description: z.string().min(20, 'Beschreibung muss mindestens 20 Zeichen lang sein'),
    category: z.string().min(1, 'Kategorie erforderlich'),
    price: z.string().refine((val) => {
        const num = parseFloat(val.replace(',', '.'));
        return !isNaN(num) && num > 0;
    }, 'Preis muss eine positive Zahl sein'),
});

export const updateProfileSchema = z.object({
    id: z.string().uuid(),
    fullName: z.string().min(2),
    email: z.string().email(),
    bio: z.string().max(500).optional(),
    street: z.string().optional(),
    houseNumber: z.string().optional(),
    zipCode: z.string().regex(/^\d{5}$/).optional().or(z.literal('')),
    city: z.string().optional(),
    country: z.string().optional(),
    taxId: z.string().optional(),
    iban: z.string().optional(), // Could use specific IBAN regex
    bic: z.string().optional(),
    accountHolderName: z.string().optional(),
    // Password stuff is handled separately or needs refine
});

export const reviewSchema = z.object({
    taskId: z.string().uuid(),
    revieweeId: z.string().uuid(),
    rating: z.coerce.number().min(1).max(5),
    comment: z.string().optional(),
    type: z.enum(['helper', 'seeker']),
});
