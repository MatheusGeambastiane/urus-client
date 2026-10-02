"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const slides = [
  {
    src: "/barba_urus_barbearia.png",
    alt: "Barba sendo cuidada na Urus Barbearia",
    eyebrow: "Precisao em cada detalhe",
    title: "Seu estilo, nossa assinatura",
    position: "object-center",
  },
  {
    src: "/urus_barbearia_espera.jpg",
    alt: "Ambiente de espera da Urus Barbearia",
    eyebrow: "Conforto do inicio ao fim",
    title: "Um espaco feito para voce",
    position: "object-center",
  },
  {
    src: "/cliente_urus.jpg",
    alt: "Cliente durante atendimento na Urus Barbearia",
    eyebrow: "Experiencia Urus",
    title: "Cuidado que transforma",
    position: "object-center",
  },
] as const;

const AUTOPLAY_INTERVAL = 5_000;

export const HeroCarousel = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const interval = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, AUTOPLAY_INTERVAL);

    return () => window.clearInterval(interval);
  }, [isPaused]);

  return (
    <section
      aria-label="Destaques da Urus Barbearia"
      aria-roledescription="carrossel"
      className="group relative h-[320px] overflow-hidden rounded-[28px] bg-ink-900 shadow-soft"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsPaused(false);
        }
      }}
    >
      {slides.map((slide, index) => {
        const isActive = index === activeSlide;

        return (
          <div
            key={slide.src}
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} de ${slides.length}`}
            aria-hidden={!isActive}
            className={`absolute inset-0 transition-[opacity,transform] duration-700 ease-out ${
              isActive
                ? "scale-100 opacity-100"
                : "pointer-events-none scale-[1.03] opacity-0"
            }`}
          >
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              priority={index === 0}
              sizes="(max-width: 448px) calc(100vw - 32px), 416px"
              className={`object-cover ${slide.position}`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-black/5" />
            <div className="absolute bottom-6 left-5 right-20 space-y-1 text-white">
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/75">
                {slide.eyebrow}
              </p>
              <h2 className="font-display text-2xl font-semibold leading-tight">
                {slide.title}
              </h2>
            </div>
          </div>
        );
      })}

      <div className="absolute bottom-6 right-5 z-10 flex items-center gap-2">
        {slides.map((slide, index) => (
          <button
            key={slide.src}
            type="button"
            aria-label={`Mostrar slide ${index + 1}`}
            aria-current={index === activeSlide ? "true" : undefined}
            onClick={() => setActiveSlide(index)}
            className={`h-2 rounded-full bg-white transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black/60 ${
              index === activeSlide
                ? "w-6 opacity-100"
                : "w-2 opacity-50 hover:opacity-80"
            }`}
          />
        ))}
      </div>
    </section>
  );
};
