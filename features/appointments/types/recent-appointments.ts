export type AppointmentServiceItem = {
  id: number;
  name: string;
  category_name: string;
};

export type RecentAppointment = {
  id: number;
  date_time: string;
  professional_name: string;
  services: AppointmentServiceItem[];
  price_paid: string;
};

export type RecentAppointmentsResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: RecentAppointment[];
};
