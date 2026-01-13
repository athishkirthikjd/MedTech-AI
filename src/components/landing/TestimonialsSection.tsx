import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { testimonials } from "@/lib/mock-data";

export function TestimonialsSection() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrent((prev) => {
      if (newDirection === 1) {
        return prev === testimonials.length - 1 ? 0 : prev + 1;
      }
      return prev === 0 ? testimonials.length - 1 : prev - 1;
    });
  };

  // Auto-advance carousel
  useEffect(() => {
    const timer = setInterval(() => {
      paginate(1);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="testimonials" className="py-24">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Loved by
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"> Healthcare Heroes</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See what patients, doctors, and administrators are saying about their experience with MedTech AI.
          </p>
        </motion.div>

        {/* Testimonial Carousel */}
        <div className="relative max-w-4xl mx-auto">
          {/* Quote Icon */}
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Quote className="w-8 h-8 text-primary" />
          </div>

          {/* Carousel Container */}
          <div className="relative bg-card rounded-3xl shadow-xl border border-border overflow-hidden py-16 px-8 md:px-16">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={current}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="text-center"
              >
                {/* Stars */}
                <div className="flex justify-center gap-1 mb-6">
                  {Array.from({ length: testimonials[current].rating }).map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-xl md:text-2xl text-foreground mb-8 leading-relaxed italic">
                  "{testimonials[current].content}"
                </p>

                {/* Author */}
                <div className="flex items-center justify-center gap-4">
                  <Avatar className="w-14 h-14 border-2 border-primary">
                    <AvatarImage src={testimonials[current].avatar} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {testimonials[current].name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <p className="font-semibold text-foreground">{testimonials[current].name}</p>
                    <p className="text-sm text-muted-foreground">{testimonials[current].role}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Arrows */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full"
              onClick={() => paginate(-1)}
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full"
              onClick={() => paginate(1)}
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          </div>

          {/* Dots Navigation */}
          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setDirection(index > current ? 1 : -1);
                  setCurrent(index);
                }}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  index === current
                    ? "bg-primary w-8"
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
