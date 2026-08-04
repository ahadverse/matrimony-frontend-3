'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export function StaggerList({ children, ...props }: HTMLMotionProps<'div'>) {
  return (
    <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} {...props}>
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, ...props }: HTMLMotionProps<'div'>) {
  return (
    <motion.div variants={item} {...props}>
      {children}
    </motion.div>
  );
}
