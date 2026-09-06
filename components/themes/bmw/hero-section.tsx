"use client";

import { motion } from "motion/react";
import { Button } from "@/components/themes/bmw/ui/button";
import { Container } from "@/components/themes/bmw/ui/container";
import { ArrowRightIcon } from "@/components/icons";

export function HeroSection() {
  return (
    <section
      id="top"
      className="relative overflow-hidden sm:flex sm:min-h-[96svh] sm:items-end"
    >
      <div className="relative h-96 w-full overflow-hidden sm:absolute sm:inset-0 sm:h-auto">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster="/hero-images/coverr-the-rear-of-a-bmw-m4-7342-1080p-poster.jpg"
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source
            src="/hero-images/coverr-the-rear-of-a-bmw-m4-7342-1080p.mp4"
            type="video/mp4"
          />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-bg sm:hidden" />
        <div className="absolute inset-0 hidden bg-gradient-to-t from-bg/45 via-bg/15 to-transparent sm:block" />
        <div className="absolute inset-x-0 bottom-0 hidden h-24 bg-gradient-to-t from-bg to-transparent sm:block" />
      </div>

      <Container className="relative pb-12 pt-8 sm:pb-28 sm:pt-40">
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
          className="text-center font-mono text-sm uppercase sm:text-xs tracking-[0.2em] text-accent sm:text-left"
        >
          Usados Certificados
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 28, delay: 0.08 }}
          className="mx-auto mt-4 max-w-2xl text-balance text-center text-4xl font-semibold leading-[1.08] tracking-tight text-fg sm:mx-0 sm:text-left sm:text-5xl lg:text-6xl"
        >
          Subite al auto que veniás buscando.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 28, delay: 0.16 }}
          className="mx-auto mt-5 max-w-lg text-balance text-center text-base leading-relaxed text-fg-muted sm:mx-0 sm:text-left sm:text-lg"
        >
          Vehículos de alto rendimiento, lujo y uso diario seleccionados a mano — todos
          respaldados por una inspección de 150 puntos y una garantía de devolución de 7 días.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 28, delay: 0.24 }}
          className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:justify-start"
        >
          <Button
            href="#inventory"
            size="lg"
            icon={<ArrowRightIcon className="h-4 w-4" />}
            className="w-3/4 !rounded-none !px-5 sm:w-auto"
          >
            Ver Inventario
          </Button>
          <span className="hidden sm:inline-block">
            <Button href="#tools" variant="ghost" size="lg">
              Calculá tu cuota
            </Button>
          </span>
        </motion.div>
      </Container>
    </section>
  );
}
