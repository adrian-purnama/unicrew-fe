export default function Footer() {
    return (
        <footer className="footer bg-color-2 border-t-1 border-gray">
            <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                {/* LOGO */}
                <div>
                    {/* <div className="text-2xl font-bold text-primary mb-2">LOGO</div> */}
                    <img
                        // onClick={() => navigate("/")}
                        src="/unicru logo.png"
                        alt="Unicru Logo"
                        className="w-20 cursor-pointer"
                    />
                </div>

                {/* Navigation */}
                <div>
                    <h3 className="footer-section-title">Company</h3>
                    <ul className="space-y-2">
                        <li>
                            <a href="#" className="footer-link">
                                About
                            </a>
                        </li>
                        <li>
                            <a href="#" className="footer-link">
                                Careers
                            </a>
                        </li>
                        <li>
                            <a href="#" className="footer-link">
                                Contact
                            </a>
                        </li>
                    </ul>
                </div>

                {/* Legal */}
                <div>
                    <h3 className="footer-section-title">Legal</h3>
                    <ul className="space-y-2">
                        <li>
                            <a href="#" className="footer-link">
                                Privacy Policy
                            </a>
                        </li>
                        <li>
                            <a href="#" className="footer-link">
                                Terms of Service
                            </a>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="text-center pt-4 border-t border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-400 text-sm">
                &copy; {new Date().getFullYear()} Unicrew. All rights reserved.
            </div>
            <div className="text-center pb-4 text-[.7rem] text-gray-200">
                Made With Love - By Adrian
            </div>
        </footer>
    );
}
