import { useNavigate } from "react-router-dom";
import { User, Building2, ArrowRight, Star, Briefcase, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginOptions() {
    const navigate = useNavigate();

    const handleLogin = (role) => {
        navigate(`/auth/${role}/register`);
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 40 },
        visible: (i) => ({
            opacity: 1,
            y: 0,
            transition: { delay: i * 0.15, duration: 0.6, ease: "easeOut" },
        }),
    };

    return (
        <div className="w-full max-w-2xl mx-auto space-y-6">
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Start Your Journey Today
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                    Choose your path and join thousands of successful professionals
                </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
                {[
                    {
                        role: "user",
                        title: "I'm a Student",
                        desc: "Find internships, entry-level jobs, and kickstart your career with top companies",
                        gradient: "from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800",
                        iconBg: "bg-blue-500",
                        icon: <User className="w-6 h-6 text-white" />,
                        stat: "20,000+ active students",
                        statIcon: <Star className="w-3 h-3 mr-1" />,
                    },
                    {
                        role: "company",
                        title: "I'm a Company",
                        desc: "Post jobs, find talented graduates, and build your dream team effortlessly",
                        gradient: "from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800",
                        iconBg: "bg-purple-500",
                        icon: <Building2 className="w-6 h-6 text-white" />,
                        stat: "2,000+ hiring companies",
                        statIcon: <Briefcase className="w-3 h-3 mr-1" />,
                    },
                ].map((item, i) => (
                    <motion.button
                        key={item.role}
                        custom={i}
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleLogin(item.role)}
                        className={`group relative overflow-hidden bg-gradient-to-r ${item.gradient} text-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300`}
                    >
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-gradient-to-r from-white/10 to-white/5 transition-opacity"></div>
                        <div className="relative z-10 text-left space-y-4">
                            <div className="flex items-center justify-between">
                                <div
                                    className={`w-12 h-12 ${item.iconBg} rounded-xl flex items-center justify-center`}
                                >
                                    {item.icon}
                                </div>
                                <ArrowRight className="w-5 h-5 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
                                <p className="text-white/80 text-sm leading-relaxed">{item.desc}</p>
                            </div>
                            <div className="flex items-center text-xs text-white/70 pt-2">
                                {item.statIcon}
                                {item.stat}
                            </div>
                        </div>
                    </motion.button>
                ))}
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-center space-y-3"
            >
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center justify-center lg:justify-start">
                    {["Free forever", "No credit card required", "Start applying today"].map(
                        (txt, i) => (
                            <div
                                key={i}
                                className="flex items-center text-xs sm:text-sm text-gray-600 dark:text-gray-400"
                            >
                                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                                {txt}
                            </div>
                        )
                    )}
                </div>
            </motion.div>
        </div>
    );
}
