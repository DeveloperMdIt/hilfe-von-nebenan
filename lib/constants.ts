
export const TASK_CATEGORIES = [
    { slug: 'shopping', name: 'Einkaufen' },
    { slug: 'pets', name: 'Tierbetreuung' },
    { slug: 'diy', name: 'Handwerk' },
    { slug: 'garden', name: 'Garten' },
    { slug: 'transport', name: 'Transport' },
    { slug: 'care', name: 'Pflege & Begleitung' },
    { slug: 'tech', name: 'PC & Technik-Hilfe' },
    { slug: 'household', name: 'Haushalt & Reinigung' },
    { slug: 'errands', name: 'Botengänge' },
    { slug: 'social', name: 'Freizeit & Gesellschaft' },
    { slug: 'house-sitting', name: 'Haussitting & Pflanzen' },
    { slug: 'childcare', name: 'Kinderbetreuung' },
    { slug: 'repair', name: 'Reparaturen (Elektro & Kleingeräte)' },
    { slug: 'learning', name: 'Lernen & Nachhilfe' },
    { slug: 'auto', name: 'Auto, Boot & Zweirad' },
    { slug: 'parcel', name: 'Paket- & Post-Service' },
    { slug: 'moving', name: 'Umzug- & Möbelhilfe' },
];

export const CATEGORY_LABELS: Record<string, string> = TASK_CATEGORIES.reduce((acc, cat) => {
    acc[cat.slug] = cat.name;
    return acc;
}, {} as Record<string, string>);

export function getCategoryLabel(slug: string | null | undefined): string {
    if (!slug) return 'Allgemein';
    return CATEGORY_LABELS[slug.toLowerCase()] || slug;
}
