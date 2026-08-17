import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Quote, ChevronLeft, ChevronRight } from 'lucide-react';

const testimonials = [
  {
    name: "Rahul Sharma",
    role: "Devotee",
    text: "Hari Pathshala has completely transformed my daily routine. The Bhagavad Gita sessions bring so much clarity and peace to my mind."
  },
  {
    name: "Priya Patel",
    role: "Student",
    text: "Learning Sanskrit here feels so natural. The environment is pure and divine. I am deeply grateful to Ajay Swami ji."
  },
  {
    name: "Vikram Singh",
    role: "Community Member",
    text: "The Ramcharitmanas recitations fill my heart with devotion. It truly is a modern gurukul that preserves our Sanatana Dharma."
  }
];

export default function Testimonials() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const next = () => setCurrent((prev) => (prev + 1) % testimonials.length);
  const prev = () => setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  return (
    <section className="py-24 bg-transparent border-y border-stone-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-stone-900 mb-4">Devotee Experiences</h2>
          <div className="w-24 h-1 bg-orange-300 mx-auto rounded-full"></div>
        </div>

        <div className="relative max-w-4xl mx-auto">
          <div className="absolute top-0 left-0 -translate-x-4 md:-translate-x-12 -translate-y-8 text-orange-100">
            <Quote size={80} className="transform rotate-180" />
          </div>
          
          <div className="min-h-[250px] flex items-center justify-center relative z-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5 }}
                className="text-center px-4 md:px-12"
              >
                <p className="text-xl md:text-3xl text-stone-600 font-serif italic leading-relaxed mb-8">
                  "{testimonials[current].text}"
                </p>
                <div>
                  <h4 className="font-bold text-stone-900 text-lg">{testimonials[current].name}</h4>
                  <span className="text-orange-600 font-bold text-sm uppercase tracking-wider">{testimonials[current].role}</span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex justify-center items-center space-x-6 mt-12">
            <button onClick={prev} className="p-3 rounded-full bg-white border border-stone-200 text-stone-600 hover:bg-orange-50 hover:text-orange-600 transition-colors shadow-sm">
              <ChevronLeft size={24} />
            </button>
            <div className="flex space-x-2">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrent(idx)}
                  className={`w-3 h-3 rounded-full transition-all ${current === idx ? 'bg-orange-500 w-8' : 'bg-stone-300'}`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
            <button onClick={next} className="p-3 rounded-full bg-white border border-stone-200 text-stone-600 hover:bg-orange-50 hover:text-orange-600 transition-colors shadow-sm">
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
