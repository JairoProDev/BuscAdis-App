'use client'

import { motion } from 'framer-motion';
import Container from '@/components/shared/Container';
import { SparklesIcon, StarIcon } from '@heroicons/react/24/solid';
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
                                        <StarIcon key={i} className={`w-4 h-4 ${i < 5 ? 'fill-yellow-400' : 'text-gray-500'}`} />
                                    ))}
                                    <span className={`ml-2 text-xs ${primaryLightColor}/70`}>Verificado</span>
                                </div>
                            </motion.div>
                        </div>
                    ))}
                </Slider>
            </Container>
        </section>
    );
}