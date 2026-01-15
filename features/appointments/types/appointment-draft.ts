export type AppointmentDraft = {
  appointmentId?: number;
  serviceId: number;
  serviceName?: string;
  servicePrice?: string;
  date?: string;
  time?: string;
  professionalId?: number;
  professionalName?: string;
};
