import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FaFacebook,
  FaTwitter,
  FaLinkedin,
  FaInstagram,
  FaYoutube,
  FaGraduationCap,
  FaArrowUp,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaHeart,
  FaBook,
  FaUsers,
  FaCertificate,
  FaGlobe,
  FaShieldAlt,
  FaQuestionCircle,
} from "react-icons/fa";
import { useState, useEffect } from "react";

const Footer = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const footerSections = [
    {
      title: "Learn",
      links: [
        { name: "Browse Courses", href: "/courses", icon: FaBook },
        {
          name: "Free Courses",
          href: "/courses?type=free",
          icon: FaGraduationCap,
        },
        { name: "Certificates", href: "/certificates", icon: FaCertificate },
        { name: "Learning Paths", href: "/learning-paths", icon: FaUsers },
      ],
    },
    {
      title: "Company",
      links: [
        { name: "About Us", href: "/about", icon: FaUsers },
        { name: "Contact", href: "/contact", icon: FaPhone },
        { name: "Careers", href: "/careers", icon: FaGraduationCap },
        { name: "Press", href: "/press", icon: FaGlobe },
      ],
    },
    {
      title: "Support",
      links: [
        { name: "Help Center", href: "/help", icon: FaQuestionCircle },
        { name: "Privacy Policy", href: "/privacy", icon: FaShieldAlt },
        { name: "Terms of Service", href: "/terms", icon: FaShieldAlt },
        { name: "Accessibility", href: "/accessibility", icon: FaUsers },
      ],
    },
  ];

  const socialLinks = [
    {
      name: "Facebook",
      icon: FaFacebook,
      href: "#",
      color: "hover:text-blue-600",
    },
    {
      name: "Twitter",
      icon: FaTwitter,
      href: "#",
      color: "hover:text-blue-400",
    },
    {
      name: "LinkedIn",
      icon: FaLinkedin,
      href: "#",
      color: "hover:text-blue-700",
    },
    {
      name: "Instagram",
      icon: FaInstagram,
      href: "#",
      color: "hover:text-pink-500",
    },
    {
      name: "YouTube",
      icon: FaYoutube,
      href: "#",
      color: "hover:text-red-500",
    },
  ];

  const stats = [
    { number: "50K+", label: "Active Students", icon: FaUsers },
    { number: "1K+", label: "Expert Courses", icon: FaBook },
    { number: "100+", label: "Industry Experts", icon: FaCertificate },
    { number: "95%", label: "Success Rate", icon: FaGraduationCap },
  ];

  return (
    <footer className="relative bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 text-white overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-indigo-500/10 to-purple-600/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-blue-500/10 to-cyan-600/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-500/5 to-pink-600/5 rounded-full blur-3xl"></div>
      </div>

      {/* Subtle Pattern Overlay */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="relative z-10">
        {/* Newsletter Section */}
        <section className="border-b border-gray-700/50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-500/20 to-purple-600/20 rounded-full border border-indigo-500/30 mb-6">
                <FaEnvelope className="text-indigo-400 mr-2" />
                <span className="text-sm font-semibold text-indigo-300">
                  Stay Updated
                </span>
              </div>

              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Join Our Learning{" "}
                <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  Community
                </span>
              </h2>

              <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
                Get the latest courses, updates, and learning tips delivered to
                your inbox.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="border-b border-gray-700/50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="text-center group"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl mb-3 group-hover:scale-110 transition-transform duration-300">
                    <stat.icon className="text-white text-xl" />
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                    {stat.number}
                  </div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Main Footer Content */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
              {/* Brand Section */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="lg:col-span-1"
              >
                <Link
                  to="/"
                  className="inline-flex items-center space-x-3 mb-6"
                >
                  <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                    <FaGraduationCap className="text-white text-xl" />
                  </div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                    Skillify
                  </span>
                </Link>

                <p className="text-gray-300 mb-6 leading-relaxed">
                  Empowering learners worldwide with cutting-edge courses and
                  expert instruction. Your journey to mastery starts here.
                </p>

                {/* Contact Info */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center space-x-3 text-gray-300">
                    <FaMapMarkerAlt className="text-indigo-400" />
                    <span className="text-sm">San Francisco, CA</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-300">
                    <FaPhone className="text-indigo-400" />
                    <span className="text-sm">+1 (555) 123-4567</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-300">
                    <FaEnvelope className="text-indigo-400" />
                    <span className="text-sm">hello@skillify.com</span>
                  </div>
                </div>

                {/* Social Links */}
                <div className="flex space-x-4">
                  {socialLinks.map((social, index) => (
                    <motion.a
                      key={index}
                      href={social.href}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className={`w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-xl flex items-center justify-center text-gray-400 ${social.color} transition-all duration-300 group`}
                    >
                      <social.icon className="text-lg group-hover:scale-110 transition-transform duration-300" />
                    </motion.a>
                  ))}
                </div>
              </motion.div>

              {/* Footer Links */}
              <div className="lg:col-span-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {footerSections.map((section, sectionIndex) => (
                    <motion.div
                      key={sectionIndex}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: sectionIndex * 0.1 }}
                    >
                      <h3 className="text-lg font-semibold text-white mb-6">
                        {section.title}
                      </h3>
                      <ul className="space-y-3">
                        {section.links.map((link, linkIndex) => (
                          <li key={linkIndex}>
                            <Link
                              to={link.href}
                              className="group flex items-center space-x-3 text-gray-300 hover:text-indigo-400 transition-colors duration-300"
                            >
                              <link.icon className="text-sm group-hover:text-indigo-400 transition-colors duration-300" />
                              <span className="group-hover:translate-x-1 transition-transform duration-300">
                                {link.name}
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom Section */}
        <section className="border-t border-gray-700/50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="flex items-center space-x-2 text-gray-400">
                <span>© 2025 Skillify. Made with</span>
                <FaHeart className="text-red-500 animate-pulse" />
                <span>for learners worldwide.</span>
              </div>

              <div className="flex items-center space-x-6 text-sm text-gray-400">
                <Link
                  to="/privacy"
                  className="hover:text-indigo-400 transition-colors duration-300"
                >
                  Privacy
                </Link>
                <Link
                  to="/terms"
                  className="hover:text-indigo-400 transition-colors duration-300"
                >
                  Terms
                </Link>
                <Link
                  to="/cookies"
                  className="hover:text-indigo-400 transition-colors duration-300"
                >
                  Cookies
                </Link>
                <Link
                  to="/accessibility"
                  className="hover:text-indigo-400 transition-colors duration-300"
                >
                  Accessibility
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-50 group"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <FaArrowUp className="text-lg group-hover:-translate-y-1 transition-transform duration-300" />
        </motion.button>
      )}
    </footer>
  );
};

export default Footer;
