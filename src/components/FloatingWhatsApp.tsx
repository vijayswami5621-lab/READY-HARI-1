import { MessageCircle } from 'lucide-react';
import { motion } from 'motion/react';

export default function FloatingWhatsApp() {
  const whatsappUrl = "https://wa.me/919610579423?text=Namaste%20Hari%20Pathshala%20%F0%9F%99%8F";

  return (
    <motion.a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-20 right-5 md:bottom-6 md:right-6 bg-[#25D366] text-white p-3.5 md:p-4 rounded-full shadow-2xl z-40 hover:bg-[#128C7E] transition-colors flex items-center justify-center"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 1 }}
    >
      <MessageCircle size={28} />
    </motion.a>
  );
}
