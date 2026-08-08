'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

// Placeholder — swap for the real business number before launch.
const WHATSAPP_NUMBER = '8801700000000';

export function WhatsAppFloatButton() {
  const { t } = useLanguage();

  return (
    <motion.a
      href={`https://wa.me/${WHATSAPP_NUMBER}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t('common.whatsappChat')}
      title={t('common.whatsappChat')}
      className="fixed bottom-24 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg"
      style={{ boxShadow: '0 8px 24px rgba(37, 211, 102, 0.4)' }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.94 }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <svg viewBox="0 0 32 32" width="30" height="30" fill="currentColor" aria-hidden="true">
        <path d="M16.004 3C9.376 3 4 8.373 4 15c0 2.386.696 4.61 1.897 6.48L4 29l7.72-1.865A11.94 11.94 0 0 0 16.004 27C22.632 27 28 21.627 28 15S22.632 3 16.004 3Zm0 21.75c-1.98 0-3.83-.55-5.41-1.51l-.388-.23-4.58 1.107 1.127-4.463-.253-.397A9.71 9.71 0 0 1 5.25 15c0-5.93 4.822-10.75 10.754-10.75S26.758 9.07 26.758 15 21.936 24.75 16.004 24.75Zm5.94-8.06c-.326-.163-1.926-.95-2.225-1.06-.298-.109-.516-.163-.733.163-.217.326-.842 1.06-1.033 1.278-.19.217-.38.245-.706.082-.326-.163-1.376-.507-2.622-1.615-.969-.864-1.623-1.931-1.814-2.257-.19-.326-.02-.502.143-.664.147-.146.326-.38.489-.57.163-.19.217-.326.326-.543.109-.217.054-.408-.027-.57-.082-.163-.733-1.765-1.005-2.419-.264-.635-.532-.549-.733-.559-.19-.009-.407-.011-.625-.011-.217 0-.57.082-.869.408-.298.326-1.14 1.114-1.14 2.716 0 1.602 1.167 3.15 1.33 3.368.163.217 2.298 3.508 5.567 4.92.778.336 1.385.537 1.858.687.78.248 1.49.213 2.052.129.626-.093 1.926-.787 2.198-1.548.272-.76.272-1.412.19-1.548-.08-.136-.298-.217-.624-.38Z" />
      </svg>
    </motion.a>
  );
}
