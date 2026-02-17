
export const TASK_CATEGORIES = [
    { slug: 'shopping', name: 'Einkaufen' },
    { slug: 'pets', name: 'Tierbetreuung' },
    { slug: 'diy', name: 'Handwerk' },
    { slug: 'garden', name: 'Garten' },
    { slug: 'transport', name: 'Transport' },
    { slug: 'care', name: 'Pflege' },
];

export const CATEGORY_LABELS: Record<string, string> = TASK_CATEGORIES.reduce((acc, cat) => {
    acc[cat.slug] = cat.name;
    return acc;
}, {} as Record<string, string>);

export function getCategoryLabel(slug: string | null | undefined): string {
    if (!slug) return 'Allgemein';
    return CATEGORY_LABELS[slug.toLowerCase()] || slug;
}
