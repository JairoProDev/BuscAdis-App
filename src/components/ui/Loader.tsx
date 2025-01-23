'use client'

import { motion } from 'framer-motion'

export function Loader() {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="relative">
        <motion.div
          className="w-20 h-20 border-4 border-primary-200 rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
            borderColor: [
              'rgb(14, 165, 233)',
              'rgb(16, 185, 129)',
              'rgb(14, 165, 233)'
            ]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-0 left-0 w-20 h-20 border-4 border-transparent border-t-primary-600 rounded-full"
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>
    </div>
  )
}

export default Loader 