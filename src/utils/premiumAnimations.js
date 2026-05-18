export const glowVariants = {
  hidden: { opacity: 0, boxShadow: "0 0 0 rgba(255, 215, 0, 0)" },
  visible: { 
    opacity: 1, 
    boxShadow: "0 0 20px rgba(255, 215, 0, 0.3)",
    transition: { duration: 0.5 }
  },
  hover: {
    boxShadow: "0 0 30px rgba(255, 215, 0, 0.6)",
    scale: 1.02,
    transition: { duration: 0.3 }
  }
};

export const pulseVariants = {
  initial: { scale: 1 },
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

export const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.6, ease: "easeOut" } 
  }
};

export const staggerChildren = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export const slideInRight = {
  hidden: { x: 50, opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: { type: "spring", stiffness: 100 }
  },
  exit: { 
    x: 100, 
    opacity: 0,
    transition: { duration: 0.3 }
  }
};

export const textReveal = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 }
  })
};