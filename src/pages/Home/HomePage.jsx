import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import CTAButtons from "../../component/CTAButtons";
import CountUp from "../../component/CountUp";
import SecretAdminGate from "../../component/SecretAdminGate";
import { CheckCircle, User, Building2, MailCheck, Clock } from "lucide-react";
import { motion } from "framer-motion";


// Canvas parallax background with gentle micro-drift
const CanvasParallaxCircles = ({ count = 24, enabled = true }) => {
  const canvasRef = useRef(null);
  const circlesRef = useRef([]);
  const startRef = useRef(null);

  useEffect(() => {
    if (!enabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // seed circles
    circlesRef.current = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 5 + 2,
      color: Math.random() > 0.5 ? "#77C3E5" : "#a3a3a3",
      depth: Math.random() * 0.5 + 0.2,
      opacity: 0,
      scale: 0.5,
      seed: Math.random() * Math.PI * 2,
      freq: 0.2 + Math.random() * 0.4,
      amp: 6 + Math.random() * 10,
    }));

    const draw = (t = 0) => {
      const scrollY = window.scrollY || 0;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      circlesRef.current.forEach((c) => {
        const drift = Math.sin(t * c.freq + c.seed) * c.amp;
        const x = c.x;
        const y = c.y + scrollY * c.depth + drift;
        ctx.beginPath();
        ctx.arc(x, y, c.r * c.scale, 0, Math.PI * 2);
        const alpha = Math.max(0, Math.min(1, c.opacity));
        ctx.fillStyle = `${c.color}${Math.floor(alpha * 255)
          .toString(16)
          .padStart(2, "0")}`;
        ctx.fill();
      });
    };

    const step = (ts) => {
      if (!startRef.current) startRef.current = ts;
      const progress = Math.min((ts - startRef.current) / 1000, 1);
      circlesRef.current.forEach((c) => {
        c.opacity = progress;
        c.scale = 0.5 + progress * 0.5; // from 0.5 to 1
      });
      draw(ts / 1000);
      requestAnimationFrame(step);
    };

    const raf = requestAnimationFrame(step);
    window.addEventListener("scroll", draw, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", draw);
      window.removeEventListener("resize", resize);
    };
  }, [count, enabled]);

  if (!enabled) return null;
  return <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />;
};

export default function HomePage() {
  const heroRef = useRef(null);
  const heroImgRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const copyRef = useRef(null);
  const ctaRef = useRef(null);

  const [reducedMotion, setReducedMotion] = useState(false);

  // Respect prefers-reduced-motion
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(!!mq.matches);
    update();
    mq.addEventListener ? mq.addEventListener("change", update) : mq.addListener(update);
    return () => {
      mq.removeEventListener ? mq.removeEventListener("change", update) : mq.removeListener(update);
    };
  }, []);

  // Parallax on scroll
  useEffect(() => {
    if (!heroRef.current) return;
    const onScroll = () => {
      const offset = (window.scrollY || 0) * 0.3;
      heroRef.current.style.transform = `translateY(${offset}px)`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // GSAP micro-animations (entrance + pointer parallax)
  useEffect(() => {
    if (reducedMotion) return;
    gsap.registerPlugin(ScrollTrigger);
    const tl = gsap
      .timeline({ defaults: { ease: "power2.out" } })
      .from(heroImgRef.current, { y: 30, opacity: 0, duration: 0.8 })
      .from(titleRef.current, { y: 20, opacity: 0, duration: 0.6 }, "-=0.4")
      .from(subtitleRef.current, { y: 16, opacity: 0, duration: 0.6 }, "-=0.35")
      .from(copyRef.current, { y: 12, opacity: 0, duration: 0.6 }, "-=0.35")
      .from(ctaRef.current, { y: 10, opacity: 0, duration: 0.6 }, "-=0.35");   

    return () => {
      tl.kill();
    };
  }, [reducedMotion]);

  // Card tilt micro-interactions
  const handleTilt = (e) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    const rx = (0.5 - y) * 6;
    const ry = (x - 0.5) * 6;
    el.style.transform = `translateZ(0) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
  };
  const resetTilt = (e) => {
    e.currentTarget.style.transform = "translateZ(0) rotateX(0) rotateY(0) translateY(0)";
  };

  return (
    <>
      <SecretAdminGate combo={{ altKey: true, shiftKey: true, key: "a" }} />

      <main className="min-h-screen bg-color-1">

        {/* Hero */}
        <section className="relative overflow-hidden w-full min-h-screen px-6 pt-6 pb-20 text-center bg-gradient-to-b from-color-1 to-color-2">
          <CanvasParallaxCircles count={30} enabled={!reducedMotion} />

          {/* Background glow */}
          <div
            aria-hidden="true"
            className="absolute top-1/5 left-1/2 w-[500px] h-[500px] -translate-x-1/2 rounded-full"
            style={{ backgroundColor: "rgba(119, 195, 229, .5)", filter: "blur(100px)", zIndex: 0 }}
          />

          <motion.div
            ref={heroRef}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="relative z-10 max-w-3xl mx-auto space-y-6"
          >
            <motion.img
              ref={heroImgRef}
              src="https://github.com/adrian-purnama/photo-host/blob/main/unicru%20photo/isometric%20mascot.png?raw=true"
              alt="Unicru mascot"
              decoding="async"
              fetchpriority="high"
              className="m-0 w-[15rem] sm:w-[26rem] mx-auto"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
            />

            <motion.h1
              ref={titleRef}
              className="font-bold text-primary text-6xl sm:text-7xl tracking-[1rem]"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
            >
              UNIKRU
            </motion.h1>

            <motion.h2
              ref={subtitleRef}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.6 }}
              className="text-4xl font-bold text-center text-color"
            >
              Where Students and Companies Connect
            </motion.h2>

            <motion.p
              ref={copyRef}
              className="max-w-xl mx-auto text-gray text-sm sm:text-base"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.6 }}
            >
              Find internships, entry-level jobs, and company culture insights — powered by
              student experiences and employer reviews.
            </motion.p>


              <CTAButtons />
          </motion.div>

          {/* Lower fade */}
          <div
            aria-hidden="true"
            className="absolute bottom-0 left-0 w-full h-[10rem] pointer-events-none"
            style={{
              background: `linear-gradient(to bottom, rgba(var(--color-bg-1), 0) 0%, rgba(var(--color-bg-1), 1) 100%)`,
              zIndex: 20,
            }}
          />
        </section>

        {/* Trusted by */}
        {/* <section className="bg-color-1 px-6 py-10">
          <div className="max-w-6xl mx-auto opacity-80">
            <p className="text-center text-xs tracking-wider text-gray mb-4">
              TRUSTED BY STUDENTS AND COMPANIES FROM
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 items-center justify-items-center text-gray">
              <span className="text-sm sm:text-base font-semibold">Top Universities</span>
              <span className="text-sm sm:text-base font-semibold">Startup Hubs</span>
              <span className="text-sm sm:text-base font-semibold">Tech Communities</span>
              <span className="text-sm sm:text-base font-semibold">Hiring Partners</span>
            </div>
          </div>
        </section> */}

        {/* About + Community */}
        <motion.section
          className="bg-color-1 py-16 px-6"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center md:items-start justify-between gap-12">
            <div className="md:w-1/2 text-center md:text-left">
              <h2 className="text-3xl font-bold mb-4 text-color">About Us</h2>
              <p className="text-gray leading-relaxed">
                Unicru is a platform dedicated to bridging the gap between graduates and companies
                across Indonesia. We believe in equal opportunity, transparency, and building
                meaningful careers from the first step.
              </p>
            </div>

            <div className="md:w-1/2 text-center flex flex-col items-center md:items-end space-y-6">
              <h2 className="text-3xl font-bold mb-4 text-color">Community</h2>
              <p className="text-gray">
                Join our growing network of over <strong>20,000 active users</strong> and
                <strong> 2,000 recruiters</strong>.
              </p>

              <div className="flex gap-10 flex-wrap justify-center md:justify-end">
                <div>
                  <CountUp from={0} to={20000} separator="," duration={1.5} className="text-5xl font-bold text-primary" />
                  <p className="text-sm font-bold text-gray mt-1">Students</p>
                </div>
                <div>
                  <CountUp from={0} to={2000} separator="," duration={1.5} className="text-5xl font-bold text-primary" />
                  <p className="text-sm font-bold text-gray mt-1">Companies</p>
                </div>
              </div>

              <Link
                to="/auth/user/register"
                className="px-5 py-2 bg-primary text-white rounded-full shadow hover:bg-primary/90 transition"
              >
                Join Now
              </Link>
            </div>
          </div>
        </motion.section>

        {/* Steps */}
        <motion.section
          className="bg-color-2 py-16 px-6"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold mb-10 text-center text-color">How to Get Started</h2>
          <div className="max-w-4xl mx-auto grid sm:grid-cols-4 gap-8">
            {[
              { step: 1, text: "Choose your role", icon: <User /> },
              { step: 2, text: "Register with your email", icon: <Building2 /> },
              { step: 3, text: "Verify your email", icon: <MailCheck /> },
              { step: 4, text: "Complete your profile", icon: <CheckCircle /> },
            ].map(({ step, text, icon }, i) => (
              <motion.div
                key={i}
                className="flex flex-col items-center text-center bg-color-1 shadow rounded-xl p-4 hover:shadow-lg transition will-change-transform"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.2 }}
                viewport={{ once: true }}
                onMouseMove={handleTilt}
                onMouseLeave={resetTilt}
              >
                <div className="bg-primary text-white rounded-full w-12 h-12 flex items-center justify-center text-lg font-bold mb-3">
                  {step}
                </div>
                <div className="text-primary mb-2">{icon}</div>
                <p className="text-gray">{text}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Support */}
        <motion.section
          className="bg-color-1 py-16 px-6 text-center"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold mb-4 text-color">Support & Guidance</h2>
          <div className="max-w-2xl mx-auto text-left space-y-4 text-gray">
            <div className="flex items-start gap-3 ">
              <MailCheck className="w-5 h-5 text-primary mt-1" />
              <p>
                <strong>Email Verification:</strong> You must verify your email before logging in or
                applying to jobs.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-primary mt-1" />
              <p>
                <strong>OTP Expiry:</strong> Verification links are valid for ~16 minutes. Please
                verify promptly.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-primary mt-1" />
              <p>
                <strong>Forgot your password?</strong> Use the
                <Link to="/forgot-password" className="text-primary underline hover:text-primary/80">
                  {" "}Forgot Password
                </Link>{" "}
                page to reset it.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <MailCheck className="w-5 h-5 text-primary mt-1" />
              <p>
                <strong>Didn’t get the email?</strong> Go to
                <Link to="/reverify" className="text-primary underline hover:text-primary/80">
                  {" "}Resend Verification
                </Link>{" "}
                to get another link.
              </p>
            </div>
          </div>
        </motion.section>

      </main>
    </>
  );
}

