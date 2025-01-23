'use client'

import { useRef } from 'react'
import { motion } from 'framer-motion'

export default function Scene3D() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="relative w-full h-[600px] bg-gradient-to-br from-primary-500/10 to-primary-500/20 rounded-2xl overflow-hidden"
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-32 h-32 bg-primary-500/20 rounded-full animate-pulse" />
      </div>
      <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-10" />
    </motion.div>
  )
} 