'use client'

import { motion } from 'framer-motion';
import Container from '@/components/shared/Container';
import { SparklesIcon, StarIcon, UserGroupIcon, ClockIcon } from '@heroicons/react/24/solid';
import { UserCircleIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const testimonialsData = [
    {
        quote: "Encontré el departamento perfecto en solo dos días. La comunicación directa por WhatsApp hizo todo más fácil y rápido.",
        author: "María López",
        location: "Lima",
        avatar: "https://randomuser.me/api/portraits/women/32.jpg",
        category: "Inmuebles"
    },
    {
        quote: "Vendí mi auto en menos de una semana y a un buen precio. Definitivamente volveré a usar Buscadis para mis anuncios.",
        author: "Carlos Mendoza",
        location: "Arequipa",
        avatar: "https://randomuser.me/api/portraits/men/46.jpg",
        category: "Vehículos"
    },
    {
        quote: "Conseguí un trabajo de desarrollador web en una startup increíble gracias a Buscadis.",
        author: "Ana Rodríguez",
        location: "Trujillo",
        avatar: "https://randomuser.me/api/portraits/women/65.jpg",
        category: "Empleos"
    },
    {
        quote: "La plataforma es muy intuitiva y fácil de usar. Publiqué mi anuncio de servicios de fontanería en minutos y recibí llamadas al instante.",
        author: "Roberto Santana",
        location: "Cusco",
        avatar: "https://randomuser.me/api/portraits/men/29.jpg",
        category: "Servicios"
    },
    {
        quote: "Compré una bicicleta de montaña de segunda mano en excelente estado a un precio increíble.",
        author: "Laura Vargas",
        location: "Huancayo",
        avatar: "https://randomuser.me/api/portraits/women/81.jpg",
        category: "Productos"
    },
    {
        quote: "Asistí a un taller de marketing digital que encontré en Buscadis y fue transformador para mi negocio.",
        author: "Javier Pérez",
        location: "Chiclayo",
        avatar: "https://randomuser.me/api/portraits/men/73.jpg",
        category: "Educación"
    },
    {
        quote: "Mi familia y yo disfrutamos de un tour increíble a Machu Picchu que reservé a través de un anuncio en Buscadis.",
        author: "Sofia Quispe",
        location: "Puno",
        avatar: "https://randomuser.me/api/portraits/women/18.jpg",
        category: "Turismo"
    },
    {
        quote: "Adopté un gatito adorable gracias a un anuncio de una protectora local en Buscadis.",
        author: "Manuel Torres",
        location: "Ica",
        avatar: "https://randomuser.me/api/portraits/men/91.jpg",
        category: "Mascotas"
    },
    {
        quote: "Encontré el proveedor perfecto para mi restaurante de comida orgánica en la sección de negocios.",
        author: "Carmen Flores",
        location: "Tacna",
        avatar: "https://randomuser.me/api/portraits/women/50.jpg",
        category: "Negocios"
    },
    {
        quote: "Publiqué un evento de música electrónica y la respuesta fue masiva. ¡Buscadis es genial para promocionar!",
        author: "Ricardo Gómez",
        location: "Piura",
        avatar: "https://randomuser.me/api/portraits/men/38.jpg",
        category: "Eventos"
    },
    {
        quote: "Conseguí un contrato de alquiler de mi local comercial rápidamente y sin complicaciones.",
        author: "Elena Chávez",
        location: "Ayacucho",
        avatar: "https://randomuser.me/api/portraits/women/99.jpg",
        category: "Inmuebles"
    },
    {
        quote: "Vendi mi camioneta 4x4 a un comprador entusiasta que contactó a través de Buscadis.",
        author: "José Castro",
        location: "Huaraz",
        avatar: "https://randomuser.me/api/portraits/men/6.jpg",
        category: "Vehículos"
    },
    {
        quote: "Mi búsqueda de un entrenador personal certificado terminó cuando encontré un excelente profesional en Buscadis.",
        author: "Isabel Rojas",
        location: "Tarapoto",
        avatar: "https://randomuser.me/api/portraits/women/23.jpg",
        category: "Servicios"
    },
    {
        quote: "Adquirí artesanía local única a través de un vendedor que encontré en la sección de productos.",
        author: "Fernando Ruiz",
        location: "Arequipa",
        avatar: "https://randomuser.me/api/portraits/men/55.jpg",
        category: "Productos"
    },
    {
        quote: "El curso online de desarrollo de aplicaciones móviles que encontré aquí impulsó mi carrera.",
        author: "Lucía Méndez",
        location: "Cajamarca",
        avatar: "https://randomuser.me/api/portraits/women/77.jpg",
        category: "Educación"
    },
    {
        quote: "Planifiqué mi escapada de fin de semana a la selva con las increíbles ofertas de turismo que encontré.",
        author: "Gabriel Vargas",
        location: "Puerto Maldonado",
        avatar: "https://randomuser.me/api/portraits/men/12.jpg",
        category: "Turismo"
    }
];

export default function Testimonials() {
    // Define tus colores personalizados basados en tu diseño
    const textColor = 'text-gray-100';
    const primaryColor = 'text-teal-400';
    const primaryLightColor = 'text-teal-300';
    const secondaryColor = 'text-cyan-100';
    const backgroundColor = 'bg-slate-900';
    const cardBg = 'bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm';
    const cardBorder = 'border border-teal-500/20';
    const cardHoverBorder = 'hover:border-cyan-400/40';
    const shadow = 'shadow-xl';

    const userBornLocation = 'Cusco, Perú'; // Definimos la variable aquí

    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 3,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 4000,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1,
                    infinite: true,
                    dots: true
                }
            },
            {
                breakpoint: 640,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    infinite: true,
                    dots: true
                }
            }
        ]
    };

    return (
        <section className={`${backgroundColor} py-24 relative overflow-hidden`}>
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 opacity-10 bg-[url('/patterns/grid.svg')]"></div>
                <div className="absolute top-40 -left-20 w-80 h-80 bg-gradient-to-br from-teal-400/10 via-teal-300/5 to-emerald-400/10 rounded-full filter blur-xl opacity-30 animate-blob animation-delay-1000" />
                <div className="absolute bottom-40 -right-20 w-80 h-80 bg-gradient-to-br from-cyan-400/10 via-cyan-300/5 to-teal-400/10 rounded-full filter blur-xl opacity-30 animate-blob animation-delay-4000" />
            </div>
            <Container className="relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <motion.div
                        className="inline-flex items-center px-4 py-1.5 rounded-full bg-gradient-to-r from-slate-800 to-slate-700 text-teal-300 text-sm font-medium mb-6 shadow-lg border border-teal-500/20 overflow-hidden"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        whileHover={{ y: -3, boxShadow: "0 0 20px rgba(20,184,166,0.3)" }}
                    >
                        <SparklesIcon className="h-4 w-4 mr-1.5 text-cyan-300" />
                        <span className="relative z-10">Experiencias Reales</span>
                        <span className="absolute inset-0 bg-gradient-to-r from-teal-500/0 via-teal-500/20 to-teal-500/0 rounded-full animate-shimmer"></span>
                    </motion.div>
                    <h2 className={`text-4xl md:text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white via-${primaryColor} to-white`}>
                        Lo que dicen nuestros usuarios
                    </h2>
                    <p className={`text-lg md:text-xl ${textColor}/90 max-w-3xl mx-auto`}>
                        Descubre cómo Buscadis está transformando la vida de personas como tú en todo {userBornLocation?.split(',')[0] || 'el mundo'}.
                    </p>
                </motion.div>

                <Slider {...settings} className="mx-auto max-w-7xl relative">
                    {testimonialsData.map((testimonial) => (
                        <div key={testimonial.author} className="p-4">
                            <motion.div
                                className={`relative group ${cardBg} ${cardBorder} ${cardHoverBorder} ${shadow} rounded-xl overflow-hidden p-6 h-full flex flex-col justify-between`}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5 }}
                                whileHover={{ y: -5 }}
                            >
                                <div className="mb-4">
                                    <div className="flex items-center mb-3">
                                        <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-teal-400 to-cyan-500 p-[1px]">
                                            <div className="absolute inset-0 rounded-full overflow-hidden">
                                                {testimonial.avatar ? (
                                                    <Image src={testimonial.avatar} alt={testimonial.author} width={40} height={40} className="w-full h-full object-cover rounded-full" />
                                                ) : (
                                                    <div className="w-full h-full rounded-full bg-slate-700 flex items-center justify-center">
                                                        <UserCircleIcon className={`w-6 h-6 ${primaryLightColor}`} />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="ml-3">
                                            <h5 className={`font-semibold text-white`}>{testimonial.author}</h5>
                                            <p className={`text-sm ${secondaryColor}/70`}>{testimonial.location}, {testimonial.category}</p>
                                        </div>
                                    </div>
                                    <blockquote className={`text-lg italic text-white`}>
                                        &ldquo;{testimonial.quote}&rdquo;
                                    </blockquote>
                                </div>
                                <div className="flex items-center space-x-1 text-yellow-400">
                                    {[...Array(5)].map((_, i) => (
                                        <StarIcon key={`star-${Math.random().toString(36).substr(2, 9)}-${Date.now()}`} className={`w-4 h-4 ${i < 5 ? 'fill-yellow-400' : 'text-gray-500'}`} />
                                    ))}
                                    <span className={`ml-2 text-xs ${primaryLightColor}/70`}>Verificado</span>
                                </div>
                            </motion.div>
                        </div>
                    ))}
                </Slider>

                {/* Enhanced CTA Section */}
                <motion.div
                    className="mt-16 sm:mt-20 text-center space-y-8"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                >
                    {/* Premium decorative divider */}
                    <div className="flex items-center justify-center space-x-4">
                        <div className="h-px bg-gradient-to-r from-transparent to-teal-500/50 w-20"></div>
                        <div className="flex space-x-2">
                            <div className="w-2 h-2 bg-teal-400 rounded-full shadow-[0_0_10px_rgba(20,184,166,0.5)]"></div>
                            <div className="w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.5)]"></div>
                            <div className="w-2 h-2 bg-teal-400 rounded-full shadow-[0_0_10px_rgba(20,184,166,0.5)]"></div>
                        </div>
                        <div className="h-px bg-gradient-to-r from-teal-500/50 to-transparent w-20"></div>
                    </div>

                    {/* Main message */}
                    <div className="space-y-4">
                        <h3 className={`text-2xl sm:text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-${primaryColor} to-white`}>
                            ¿Qué esperas para ser el próximo?
                        </h3>
                        <p className={`text-lg md:text-xl ${textColor}/80 max-w-2xl mx-auto`}>
                            Únete a miles de usuarios satisfechos y comienza tu historia de éxito con Buscadis.
                        </p>
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <motion.a
                            href="/publicar"
                            className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-slate-900 bg-gradient-to-r from-teal-300 via-cyan-300 to-teal-300 rounded-xl shadow-[0_10px_25px_-5px_rgba(34,211,238,0.4)] transition-all duration-300 overflow-hidden"
                            style={{
                                background: 'linear-gradient(135deg, #5eead4 0%, #22d3ee 50%, #5eead4 100%)'
                            }}
                            whileHover={{
                                scale: 1.05,
                                boxShadow: "0 15px 35px -5px rgba(34, 211, 238, 0.6)",
                                y: -3
                            }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <span className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-white/0 via-white/70 to-white/0 transform -skew-x-30 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></span>
                            <SparklesIcon className="w-5 h-5 mr-2 relative z-10" />
                            <span className="relative z-10">Crear mi Historia</span>
                            <svg className="w-5 h-5 ml-2 relative z-10 group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </motion.a>

                        <motion.a
                            href="/buscar"
                            className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-white/10 backdrop-blur-sm border-2 border-teal-400/30 rounded-xl hover:bg-white/20 hover:border-teal-400/50 transition-all duration-300 overflow-hidden"
                            whileHover={{
                                y: -3,
                                boxShadow: "0 10px 25px rgba(20, 184, 166, 0.3)"
                            }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <span className="absolute inset-0 bg-gradient-to-r from-teal-500/0 via-teal-500/15 to-teal-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                            <svg className="w-5 h-5 mr-2 text-teal-300 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <span className="relative z-10">Ver Testimonios</span>
                        </motion.a>
                    </div>

                    {/* Social proof indicators */}
                    <motion.div 
                        className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-8 text-sm text-cyan-200/70"
                        animate={{ opacity: [0.7, 1, 0.7] }}
                        transition={{ duration: 4, repeat: Infinity }}
                    >
                        <div className="flex items-center">
                            <UserGroupIcon className="w-4 h-4 mr-2 text-teal-300" />
                            +10,000 Usuarios Activos
                        </div>
                        <div className="flex items-center">
                            <StarIcon className="w-4 h-4 mr-2 text-yellow-400 fill-yellow-400" />
                            4.9/5 Puntuación Promedio
                        </div>
                        <div className="flex items-center">
                            <ClockIcon className="w-4 h-4 mr-2 text-teal-300" />
                            Respuesta en 24h
                        </div>
                    </motion.div>
                </motion.div>
            </Container>
        </section>
    );
}