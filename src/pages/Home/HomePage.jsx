import Navigation from "../../component/Navigation";
import Footer from "../../component/Footer";
import LoginOptions from "../../component/LoginOptions";
import { CheckCircle, User, Building2, MailCheck, Clock, ArrowRightCircle } from "lucide-react";
import TextPressure from "../../component/TextPressure";
import BlurText from "../../component/BlurText";
import CountUp from "../../component/CountUp";
import { Link } from "react-router-dom";

const HomePage = () => {
    return (
        <>
            <Navigation />

            <main className="min-h-screen bg-gradient-to-br from-background to-gray-100 dark:to-gray-800 transition-colors duration-300 text-text">
                {/* Hero Section */}
                <section className="w-full px-6 pb-10 pt-5 flex flex-col items-center text-center space-y-10">
                    <div className="max-w-3xl">
                        <img
                            src="/university hero.svg"
                            alt="Unicru Hero"
                            className="m-0 max-w-[30rem] mx-auto"
                        />
                        <div className="relative h-[190px] md:h-[250px]">
                            <TextPressure
                                text="Unicrew"
                                flex={true}
                                alpha={false}
                                stroke={false}
                                width={true}
                                weight={true}
                                italic={true}
                                textColor="#77c3e5"
                                strokeColor="#ffffff"
                                minFontSize={36}
                            />
                        </div>

                        <BlurText
                            text="Where Students and Companies Connect"
                            delay={150}
                            animateBy="words"
                            direction="top"
                            className="text-5xl tetxt-center font-bold justify-center"
                        />
                        {/* <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
                            Where Students and Companies Connect
                        </h1> */}
                    </div>
                    <p className="max-w-xl text-lg text-gray-600 dark:text-gray-300">
                        Find internships, entry-level jobs, and company culture insights — powered
                        by student experiences and employer reviews.
                    </p>
                    <LoginOptions />

                    {/* <div className="text-sm text-gray-500 dark:text-gray-400 pt-6">
                        Made By{" "}
                        <a href="https://glassdoor.com" className="underline hover:text-primary">
                            Adrian
                        </a>{" "}
                        — 😘.
                    </div> */}
                </section>

                {/* About Us + Reach Section Combined */}
                <section className="bg-white dark:bg-gray-900 py-16 px-6">
                    <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center md:items-start justify-between gap-12">
                        {/* Left: About Text */}
                        <div className="md:w-1/2 text-center md:text-left">
                            <h2 className="text-3xl font-bold mb-4">About Us</h2>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                Unicru is a platform dedicated to bridging the gap between graduates
                                and companies across Indonesia. We believe in equal opportunity,
                                transparency, and building meaningful careers from the first step.
                            </p>
                        </div>

                        {/* Right: Statistics */}
                        <div className="md:w-1/2 text-center flex flex-col items-center md:items-end space-y-6">
                            <h2 className="text-3xl font-bold mb-4">Community</h2>

                            <p className="text-gray-600 dark:text-gray-300">
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
                                        className="text-6xl font-bold text-primary"
                                    />
                                    <p className="text-lg text-gray-600 dark:text-gray-300 mt-1">
                                        Students
                                    </p>
                                </div>

                                <div>
                                    <CountUp
                                        from={0}
                                        to={2000}
                                        separator=","
                                        duration={1.5}
                                        className="text-6xl font-bold text-primary"
                                    />
                                    <p className="text-lg text-gray-600 dark:text-gray-300 mt-1">
                                        Companies
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Steps to Register as Flow */}
                <section className="bg-gray-100 dark:bg-gray-800 py-16 px-6">
                    <h2 className="text-3xl font-bold mb-10 text-center">How to Get Started</h2>

                    <div className="max-w-4xl mx-auto space-y-8 sm:space-y-0 sm:grid sm:grid-cols-4 sm:gap-6">
                        {[
                            { step: 1, text: "Choose your role: Student or Company" },
                            { step: 2, text: "Register using a valid email address" },
                            { step: 3, text: "Check your inbox for the verification link" },
                            { step: 4, text: "Complete your profile and explore opportunities" },
                        ].map(({ step, text }, index) => (
                            <div
                                key={index}
                                className="relative flex flex-col items-center text-center"
                            >
                                <div className="bg-primary text-white rounded-full w-12 h-12 flex items-center justify-center text-lg font-bold z-10">
                                    {step}
                                </div>
                                {index !== 3 && (
                                    <div className="hidden sm:block absolute top-6 right-[-1.5rem] w-6 h-1 bg-primary z-0" />
                                )}
                                <p className="mt-4 text-gray-700 dark:text-gray-300">{text}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* FAQ / Support */}
                <section className="bg-white dark:bg-gray-900 py-16 px-6 text-center">
                    <h2 className="text-3xl font-bold mb-4">Support & Guidance</h2>
                    <div className="max-w-2xl mx-auto text-left space-y-4 text-gray-600 dark:text-gray-300">
                        <div className="flex items-start gap-3">
                            <MailCheck className="w-5 h-5 text-primary mt-1" />
                            <p>
                                <strong>Email Verification:</strong> You must verify your email
                                before logging in or applying to jobs.
                            </p>
                        </div>
                        <div className="flex items-start gap-3">
                            <Clock className="w-5 h-5 text-primary mt-1" />
                            <p>
                                <strong>OTP Expiry:</strong> Verification links are only valid for
                                60,000 seconds (~16 minutes). Please verify promptly.
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
                                link to receive a reset email.
                            </p>
                        </div>
                        <div className="flex items-start gap-3">
                            <MailCheck className="w-5 h-5 text-primary mt-1" />
                            <p>
                                <strong>Didn’t get the email?</strong> Use the{" "}
                                <Link
                                    to="/reverify"
                                    className="text-primary underline hover:text-primary/80"
                                >
                                    Resend Verification
                                </Link>{" "}
                                page to get another link.
                            </p>
                        </div>
                        <div className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-primary mt-1" />
                            <p>
                                <strong>Change Password (User or Company):</strong> Go to your
                                profile to update your password, or reset via{" "}
                                <Link
                                    to="/forgot-password"
                                    className="text-primary underline hover:text-primary/80"
                                >
                                    Forgot Password
                                </Link>
                                .
                            </p>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </>
    );
};

export default HomePage;
