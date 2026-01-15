import type { ServiceCategory } from "../types/service-category";

type CategoryCarouselProps = {
  categories: ServiceCategory[];
};

export const CategoryCarousel = ({ categories }: CategoryCarouselProps) => {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-ink-500">
        Categorias
      </h2>
      <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 scrollbar-hide">
        {categories.map((category) => (
          <div
            key={category.id}
            className="flex min-w-[108px] flex-col items-center gap-3 rounded-3xl bg-white px-4 py-4 text-center shadow-soft"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ink-100">
              <img
                src={category.icon}
                alt={category.name}
                className="h-7 w-7 object-contain"
                loading="lazy"
              />
            </div>
            <span className="text-sm font-semibold text-ink-800">
              {category.name}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};
