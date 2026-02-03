export type AppointmentServiceItem = {
  id: number;
  name: string;
  category_name: string;
};

export type RecentAppointment = {
  id: number;
  date_time: string;
  status?: string;
  professional?: number;
  professional_id?: number;
  professional_name: string;
  services: AppointmentServiceItem[];
  price_paid: string;
  service_id?: number;
};

export type RecentAppointmentsResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: RecentAppointment[];
};
