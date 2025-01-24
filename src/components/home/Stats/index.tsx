'use client'

import { useInView } from 'react-intersection-observer';
import { motion } from 'framer-motion';
import Container from '@/components/shared/Container';
import CountUp from 'react-countup';

const stats = [
  {
    value: 10000,
    label: 'Usuarios activos',
    suffix: '+',
    duration: 2
  },
  {
    value: 5000,
    label: 'Anuncios publicados',
    suffix: '+',
    duration: 2
  },
  {
    value: 150,
    label: 'Conexiones diarias',
    suffix: '+',
    duration: 1.5
  },
  {
    value: 98,
    label: 'Satisfacción',
    suffix: '%',
    duration: 1.5
  }
];

export default function Stats() {
  const { ref: statsRef, inView } = useInView({
    threshold: 0.3,
    triggerOnce: true
  });

  return (
    <section ref={statsRef} className="py-20 bg-primary-900">
      <Container>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="text-center"
            >
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                {inView && (
                  <CountUp
                    end={stat.value}
                    duration={stat.duration}
                    separator=","
                    suffix={stat.suffix}
                  />
                )}
              </div>
              <div className="text-blue-100 text-lg">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
} 