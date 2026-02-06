import Link from 'next/link';
import Image from 'next/image';
import { HeroSearch } from '../components/ui/hero-search';
import { ShoppingBag, PawPrint, Hammer, Leaf, Truck, Heart } from 'lucide-react';

export default function Home() {
  const categories = [
    { name: 'Einkaufen', icon: ShoppingBag, slug: 'shopping' },
    { name: 'Tierbetreuung', icon: PawPrint, slug: 'pets' },
    { name: 'Handwerk', icon: Hammer, slug: 'diy' },
    { name: 'Garten', icon: Leaf, slug: 'garden' },
    { name: 'Transport', icon: Truck, slug: 'transport' },
    { name: 'Pflege', icon: Heart, slug: 'care' },
  ];

  return (
    <div className="h-full min-h-full overflow-hidden flex flex-col font-[family-name:var(--font-geist-sans)] bg-amber-50/50 dark:bg-zinc-950">
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-7xl grid lg:grid-cols-2 gap-8 items-center h-full max-h-[800px]">

          {/* Left: Content */}
          <div className="flex flex-col justify-center space-y-8 z-10 p-4">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight">
                Hilfe von Nebenan.<br />
                <span className="text-amber-600">Einfach. Lokal.</span>
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-lg">
                Finde vertrauenswürdige Nachbarn für Aufgaben im Alltag oder biete deine Hilfe an.
              </p>
            </div>

            <div className="w-full max-w-lg">
              <HeroSearch />

              {/* Compact Categories */}
              <div className="mt-8">
                <p className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider">Beliebte Kategorien</p>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <Link
                      key={cat.slug}
                      href={`/tasks?category=${cat.slug}`}
                      className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 hover:border-amber-400 hover:text-amber-600 transition-colors shadow-sm text-sm font-medium"
                    >
                      <cat.icon size={16} />
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Hero Image */}
          <div className="relative h-[85%] w-full hidden lg:block rounded-3xl overflow-hidden shadow-2xl hover:scale-[1.01] transition-transform duration-700 bg-amber-100 self-center">
            <Image
              src="/hero.png"
              alt="Nachbarn helfen Nachbarn"
              fill
              className="object-cover"
              priority
            />
          </div>

        </div>
      </main>
    </div>
  );
}
