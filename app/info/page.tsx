const MAPS_LINK = "https://maps.app.goo.gl/U41Ly9gyGzBVq6DPA";
const MAPS_EMBED =
  "https://www.google.com/maps?q=Rua%20Rio%20de%20S%C3%A3o%20Pedro,%202%20-%20Gra%C3%A7a&output=embed";

export default function InfoPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-6 px-4 pb-28 pt-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-ink-400">
          Informações
        </p>
        <h1 className="font-display text-2xl font-semibold text-ink-900">
          Informações da barbearia
        </h1>
        <p className="text-sm text-ink-600">
          Rua Rio de São Pedro, 2 - Graça. Em frente à Academia Bluefit
        </p>
      </header>

      <section className="space-y-3">
        <div className="overflow-hidden rounded-[28px] bg-white shadow-soft">
          <iframe
            title="Mapa da barbearia"
            src={MAPS_EMBED}
            className="h-[360px] w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
        <a
          href={MAPS_LINK}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-12 w-full items-center justify-center rounded-full bg-ink-900 text-sm font-semibold text-white transition hover:bg-ink-700"
        >
          Abrir no Google Maps
        </a>
        <a
          href="https://api.whatsapp.com/send?phone=557192109189"
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-emerald-500 text-sm font-semibold text-white transition hover:bg-emerald-600"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path d="M12.04 2C6.55 2 2.08 6.43 2.08 11.88c0 1.93.57 3.8 1.65 5.39L2 22l4.9-1.68c1.55.84 3.3 1.28 5.14 1.28h.01c5.49 0 9.96-4.43 9.96-9.88C22.01 6.43 17.54 2 12.04 2zm5.76 14.23c-.24.67-1.41 1.28-1.98 1.36-.52.08-1.19.11-1.92-.12-.44-.14-.99-.32-1.71-.62-3.01-1.29-4.98-4.24-5.13-4.44-.15-.2-1.23-1.62-1.23-3.09 0-1.47.78-2.19 1.06-2.49.28-.3.62-.37.83-.37.21 0 .41 0 .59.01.19.01.45-.07.7.54.24.59.82 2.03.9 2.18.08.15.13.33.02.53-.11.2-.16.33-.32.51-.15.18-.33.41-.47.55-.15.15-.31.31-.13.61.18.3.8 1.32 1.72 2.14 1.18 1.05 2.18 1.38 2.49 1.54.31.15.49.13.67-.08.19-.2.77-.9.97-1.21.2-.31.41-.25.69-.15.28.1 1.77.83 2.08.98.31.15.51.22.59.34.08.12.08.7-.16 1.37z" />
          </svg>
          Chamar no WhatsApp
        </a>
      </section>
    </main>
  );
}
