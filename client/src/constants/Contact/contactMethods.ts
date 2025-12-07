import { FaEnvelope, FaHeadset, FaMapMarkerAlt, FaPhone } from "react-icons/fa";

const contactMethods = [
  {
    icon: FaPhone,
    title: "Call Us",
    description: "Speak with our team",
    value: "+1 (555) 123-4567",
    action: "tel:+15551234567",
    color: "from-blue-500 to-cyan-500",
    available: "Mon-Fri 9AM-6PM PST",
  },
  {
    icon: FaEnvelope,
    title: "Email Us",
    description: "Send us a message",
    value: "hello@skillify.com",
    action: "mailto:hello@skillify.com",
    color: "from-purple-500 to-pink-500",
    available: "24/7 Response",
  },
  {
    icon: FaHeadset,
    title: "Live Chat",
    description: "Get instant help",
    value: "Start Chat",
    action: "#",
    color: "from-green-500 to-emerald-500",
    available: "Available Now",
  },
  {
    icon: FaMapMarkerAlt,
    title: "Visit Us",
    description: "Our main office",
    value: "San Francisco, CA",
    action: "#",
    color: "from-orange-500 to-red-500",
    available: "By Appointment",
  },
];

export default contactMethods;
