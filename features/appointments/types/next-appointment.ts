export type NextAppointment = {
  id: number;
  date_time: string;
  professional: number;
  professional_name: string;
  service_id?: number;
  service_name: string;
  price_paid: string;
};
