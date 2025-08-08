// RegisterOptions.jsx (scroll-powered + side-scroll compatible centerpiece)
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

export default function RegisterOptions() {
  const navigate = useNavigate();
  const containerRef = useRef(null);

  const handleRegister = (role) => {
    navigate(`/auth/${role}/register`);
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        "#register-title",
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top center",
            toggleActions: "play none none none",
          },
        }
      );

      gsap.fromTo(
        "#register-buttons button",
        { opacity: 0, scale: 0.8 },
        {
          opacity: 1,
          scale: 1,
          duration: 1,
          stagger: 0.3,
          ease: "elastic.out(1, 0.5)",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top center+=100",
            toggleActions: "play none none none",
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="min-h-screen flex flex-col justify-center items-center px-4 sm:px-6 bg-gradient-to-br from-[#0f172a] to-[#1e293b] text-text"
    >
      <div className="w-full max-w-3xl p-10 rounded-3xl bg-white/5 text-white shadow-2xl backdrop-blur-xl border border-white/10 space-y-10">
        <div id="register-title">
          <h2 className="text-6xl font-extrabold text-center text-primary drop-shadow-xl tracking-tight">
            Join Unicrew
          </h2>
          <p className="text-center text-xl text-white/80 mt-3">
            Where students and companies build careers together
          </p>
        </div>

        <div id="register-buttons" className="grid gap-6 sm:grid-cols-2">
          <button
            onClick={() => handleRegister("company")}
            className="btn-highlight py-5 font-bold text-white rounded-2xl text-xl shadow-xl hover:scale-105 hover:shadow-primary transition duration-300"
          >
            I'm a Company
          </button>
          <button
            onClick={() => handleRegister("user")}
            className="btn-primary py-5 font-bold text-white rounded-2xl text-xl shadow-xl hover:scale-105 hover:shadow-blue-400 transition duration-300"
          >
            I'm a Student
          </button>
        </div>
      </div>
    </div>
  );
} 
