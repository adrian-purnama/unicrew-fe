import Footer from "../../component/Footer";
import { CheckCircle, User, Building2, MailCheck, Clock } from "lucide-react";
import CountUp from "../../component/CountUp";
import { Link } from "react-router-dom";
import { useEffect, useRef } from "react";
import CTAButtons from "../../component/CTAButtons";
import Navigation from "../../component/Navigation";
import { motion } from "framer-motion";

/* ===== Canvas-based parallax circle background ===== */
const CanvasParallaxCircles = ({ count = 30 }) => {
    const canvasRef = useRef(null);
    const circles = useRef([]);
    const animationStart = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);

        // Generate circles with random attributes
        circles.current = Array.from({ length: count }, () => ({
            baseX: Math.random() * canvas.width,
            baseY: Math.random() * canvas.height,
            radius: Math.random() * 5 + 2,
            color: Math.random() > 0.5 ? "#77C3E5" : "#a3a3a3",
            depth: Math.random() * 0.5 + 0.2, // how much it moves with scroll
            opacity: 0, // start transparent
            scale: 0.5, // start smaller
        }));

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const scrollY = window.scrollY;

            circles.current.forEach((c) => {
                const x = c.baseX;
                const y = c.baseY + scrollY * c.depth;
                ctx.beginPath();
                ctx.arc(x, y, c.radius * c.scale, 0, Math.PI * 2);
                ctx.fillStyle = `${c.color}${Math.floor(c.opacity * 255)
                    .toString(16)
                    .padStart(2, "0")}`;
                ctx.fill();
            });
        };

        const animateEntrance = (timestamp) => {
            if (!animationStart.current) animationStart.current = timestamp;
            const progress = Math.min((timestamp - animationStart.current) / 1000, 1); // 1s fade-in

            circles.current.forEach((c) => {
                c.opacity = progress;
                c.scale = 0.5 + progress * 0.5; // from 0.5 → 1
            });

            draw();
            if (progress < 1) requestAnimationFrame(animateEntrance);
        };

        requestAnimationFrame(animateEntrance);

        window.addEventListener("scroll", draw);

        return () => {
            window.removeEventListener("scroll", draw);
            window.removeEventListener("resize", resizeCanvas);
        };
    }, [count]);

    return <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />;
};

const HomePage = () => {
    const heroRef = useRef(null);

    // Parallax scroll effect for hero content
    useEffect(() => {
        const handleScroll = () => {
            if (heroRef.current) {
                const offset = window.scrollY * 0.3;
                heroRef.current.style.transform = `translateY(${offset}px)`;
            }
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <>
            <Navigation />

            <main className="min-h-screen bg-color-1">
                {/* ===== HERO SECTION ===== */}
                <section className="relative overflow-hidden w-full min-h-screen px-6 pt-24 pb-20 text-center bg-gradient-to-b from-color-1 to-color-2">
                    <CanvasParallaxCircles count={20} />

                    {/* Blurred background circle */}
                    <div
                        aria-hidden="true"
                        className="absolute top-1/5 left-1/2 w-[500px] h-[500px] -translate-x-1/2 rounded-full"
                        style={{
                            backgroundColor: "rgba(119, 195, 229, .5)", // primary color with opacity
                            filter: "blur(100px)",
                            zIndex: 0,
                        }}
                    />

                    {/* Hero Content */}
                    <motion.div
                        ref={heroRef}
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1 }}
                        className="relative z-10 max-w-3xl mx-auto space-y-6"
                    >
                        <motion.img
                            src="https://raw.githubusercontent.com/adrian-purnama/photo-host/refs/heads/main/unicru%20photo/university-hero.png"
                            alt="Unicru Hero"
                            className="m-0 w-[15rem] sm:w-[26rem] mx-auto"
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 1, ease: "easeOut" }}
                        />

                        <motion.h1
                            className="font-bold text-primary text-6xl sm:text-7xl tracking-[1rem]"
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 1, delay: 0.3 }}
                        >
                            UNIKRU
                        </motion.h1>

                        {/* <BlurText
                            text="Where Students and Companies Connect"
                            delay={150}
                            animateBy="words"
                            direction="top"
                            className="text-3xl sm:text-4xl font-bold text-color"
                        /> */}

                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, delay: 0.6 }}
                            className="text-4xl font-bold text-center text-color"
                        >
                            Where Students and Companies Connect
                        </motion.h2>
                        <motion.p
                            className="max-w-xl mx-auto text-gray text-sm sm:text-base"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 1, delay: 0.6 }}
                        >
                            Find internships, entry-level jobs, and company culture insights —
                            powered by student experiences and employer reviews.
                        </motion.p>

                        {/* CTA Buttons */}
                        <motion.div
                            className="flex flex-col sm:flex-row gap-4 justify-center mt-6"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, delay: 0.8 }}
                        >
                            <CTAButtons />
                        </motion.div>
                    </motion.div>
                    <div
                        aria-hidden="true"
                        className="absolute bottom-0 left-0 w-full h-[10rem] pointer-events-none"
                        style={{
                            background: `linear-gradient(
                                to bottom,
                                rgba(var(--color-bg-1), 0) 0%,
                                rgba(var(--color-bg-1), 1) 100%
                            )`,
                            zIndex: 20,
                        }}
                    />
                </section>

                {/* ===== ABOUT + COMMUNITY ===== */}
                <motion.section
                    className="bg-color-1 py-16 px-6"
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                >
                    <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center md:items-start justify-between gap-12">
                        {/* About */}
                        <div className="md:w-1/2 text-center md:text-left">
                            <h2 className="text-3xl font-bold mb-4 text-color">About Us</h2>
                            <p className="text-gray leading-relaxed">
                                Unicru is a platform dedicated to bridging the gap between graduates
                                and companies across Indonesia. We believe in equal opportunity,
                                transparency, and building meaningful careers from the first step.
                            </p>
                        </div>

                        {/* Community */}
                        <div className="md:w-1/2 text-center flex flex-col items-center md:items-end space-y-6">
                            <h2 className="text-3xl font-bold mb-4 text-color">Community</h2>
                            <p className="text-gray">
                                Join our growing network of over{" "}
                                <strong>20,000 active users</strong> and{" "}
                                <strong>2,000 recruiters</strong>.
                            </p>

                            <div className="flex gap-10 flex-wrap justify-center md:justify-end">
                                <div>
                                    <CountUp
                                        from={0}
                                        to={20000}
                                        separator=","
                                        duration={1.5}
                                        className="text-5xl font-bold text-primary"
                                    />
                                    <p className="text-sm font-bold text-gray mt-1">Students</p>
                                </div>
                                <div>
                                    <CountUp
                                        from={0}
                                        to={2000}
                                        separator=","
                                        duration={1.5}
                                        className="text-5xl font-bold text-primary"
                                    />
                                    <p className="text-sm font-bold text-gray mt-1">Companies</p>
                                </div>
                            </div>

                            <Link
                                to="/auth/user/register"
                                className="px-5 py-2 bg-primary text-white rounded-full shadow hover:bg-primary/90 transition cursor-glow"
                            >
                                Join Now
                            </Link>
                        </div>
                    </div>
                </motion.section>

                {/* ===== STEPS TO GET STARTED ===== */}
                <motion.section
                    className="bg-color-2 py-16 px-6"
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-3xl font-bold mb-10 text-center text-color">
                        How to Get Started
                    </h2>
                    <div className="max-w-4xl mx-auto grid sm:grid-cols-4 gap-8">
                        {[
                            { step: 1, text: "Choose your role", icon: <User /> },
                            { step: 2, text: "Register with your email", icon: <Building2 /> },
                            { step: 3, text: "Verify your email", icon: <MailCheck /> },
                            { step: 4, text: "Complete your profile", icon: <CheckCircle /> },
                        ].map(({ step, text, icon }, i) => (
                            <motion.div
                                key={i}
                                className="flex flex-col items-center text-center bg-color-1 shadow rounded-xl p-4 hover:shadow-lg transition transform hover:-translate-y-1"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: i * 0.2 }}
                                viewport={{ once: true }}
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

                {/* ===== SUPPORT ===== */}
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
                                <strong>Email Verification:</strong> You must verify your email
                                before logging in or applying to jobs.
                            </p>
                        </div>
                        <div className="flex items-start gap-3">
                            <Clock className="w-5 h-5 text-primary mt-1" />
                            <p>
                                <strong>OTP Expiry:</strong> Verification links are valid for ~16
                                minutes. Please verify promptly.
                            </p>
                        </div>
                        <div className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-primary mt-1" />
                            <p>
                                <strong>Forgot your password?</strong> Use the{" "}
                                <Link
                                    to="/forgot-password"
                                    className="text-primary underline hover:text-primary/80"
                                >
                                    Forgot Password
                                </Link>{" "}
                                page to reset it.
                            </p>
                        </div>
                        <div className="flex items-start gap-3">
                            <MailCheck className="w-5 h-5 text-primary mt-1" />
                            <p>
                                <strong>Didn’t get the email?</strong> Go to{" "}
                                <Link
                                    to="/reverify"
                                    className="text-primary underline hover:text-primary/80"
                                >
                                    Resend Verification
                                </Link>{" "}
                                to get another link.
                            </p>
                        </div>
                    </div>
                </motion.section>
            </main>

            <Footer />
        </>
    );
};

export default HomePage;
