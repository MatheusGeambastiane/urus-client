import type { ServiceGroup } from "../utils/group-services";
import { ServiceCategorySection } from "./service-category-section";

type ServicesListProps = {
  groups: ServiceGroup[];
};

export const ServicesList = ({ groups }: ServicesListProps) => {
  return (
    <div className="space-y-8">
      {groups.map((group) => (
        <ServiceCategorySection
          key={group.categoryName}
          categoryName={group.categoryName}
          services={group.services}
        />
      ))}
    </div>
  );
};
