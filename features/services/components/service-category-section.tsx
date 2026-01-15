"use client";

import { useMemo, useState } from "react";
import { serviceSearchSchema } from "../validation/service-search";
import type { Service } from "../types/service";
import { formatCurrency, formatDuration } from "@/shared/lib/formatters";
import { Input } from "@/shared/ui/input";
import Link from "next/link";

type ServiceCategorySectionProps = {
  categoryName: string;
  services: Service[];
};

export const ServiceCategorySection = ({
  categoryName,
  services,
}: ServiceCategorySectionProps) => {
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  const filteredServices = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return services;
    return services.filter((service) =>
      service.name.toLowerCase().includes(query)
    );
  }, [search, services]);

  const handleChange = (value: string) => {
    const validation = serviceSearchSchema.safeParse(value);
    setSearch(value);
    setError(validation.success ? null : validation.error.issues[0]?.message ?? null);
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-ink-900">{categoryName}</h3>
          <p className="text-xs uppercase tracking-[0.2em] text-ink-400">
            Servicos da categoria
          </p>
        </div>
        <span className="rounded-full bg-ink-100 px-3 py-1 text-xs font-semibold text-ink-600">
          {services.length} opcoes
        </span>
      </div>

      <div className="space-y-2">
        <Input
          value={search}
          onChange={(event) => handleChange(event.target.value)}
          placeholder={`Buscar em ${categoryName}`}
          hasError={Boolean(error)}
          aria-label={`Buscar servicos de ${categoryName}`}
        />
        {error ? (
          <p className="text-xs text-red-600">{error}</p>
        ) : null}
      </div>

      <div className="space-y-3">
        {filteredServices.map((service) => (
          <article
            key={service.id}
            className="flex items-center justify-between gap-4 rounded-3xl bg-white px-4 py-4 shadow-soft"
          >
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <h4 className="text-base font-semibold text-ink-900">
                  {service.name}
                </h4>
                <span className="text-sm font-semibold text-ink-700">
                  {formatCurrency(service.price)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-ink-500">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-ink-100">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 7V12L15 15"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle
                      cx="12"
                      cy="12"
                      r="9"
                      stroke="currentColor"
                      strokeWidth="1.6"
                    />
                  </svg>
                </span>
                <span>{formatDuration(service.duration)}</span>
              </div>
            </div>
            <Link
              href={`/services/${service.id}/schedule`}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-ink-900 text-white transition hover:bg-ink-700"
              aria-label="Selecionar"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M8 6L18 12L8 18V6Z" fill="currentColor" />
              </svg>
            </Link>
          </article>
        ))}
        {filteredServices.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-ink-200 bg-white/60 px-4 py-5 text-sm text-ink-500">
            Nenhum servico encontrado para este filtro.
          </div>
        ) : null}
      </div>
    </section>
  );
};
