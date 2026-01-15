import type { Service } from "../types/service";

export type ServiceGroup = {
  categoryName: string;
  services: Service[];
};

export const groupServicesByCategory = (services: Service[]): ServiceGroup[] => {
  const groups = new Map<string, Service[]>();

  services.forEach((service) => {
    const current = groups.get(service.category_name) ?? [];
    current.push(service);
    groups.set(service.category_name, current);
  });

  return Array.from(groups.entries()).map(([categoryName, items]) => ({
    categoryName,
    services: items,
  }));
};
