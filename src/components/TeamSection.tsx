import React from "react";
import { motion } from "framer-motion";
import { Award, Users, Calendar, Star } from "lucide-react";
import eapenImage from "../images/EAPEN.jpg";
import sibyImage from "../images/SIBY.jpg";
import { Spotlight } from "./ui/spotlight-new";

const team = [
  {
    name: "Mr Eapen",
    role: "Creative Lead",
    image: eapenImage,
    expertise: [
      "Premium Catering Menus",
      "Luxury Car Rental Coordination",
      "Guest Experience Planning",
    ],
    experience: "30+ Years Experience",
    speciality: "Premium Catering & Guest Experiences",
  },
  {
    name: "Mr Siby",
    role: "Event Director",
    image: sibyImage,
    expertise: [
      "Full Auditorium Decoration",
      "Premium Material Coordination",
      "Client Consultation & Planning",
    ],
    experience: "30+ Years Experience",
    speciality: "Hall Transformations & Luxury Themes",
  },
];

const TeamSection = () => {
  return (
    <section
      id="our-team"
      className="section-padding relative min-h-screen bg-black/[0.96] antialiased bg-grid-white/[0.02] overflow-hidden"
    >
      <Spotlight />
      <div className="container-width relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-600">
            Meet Our Team
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Our talented professionals bring creativity and expertise to every
            event
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {team.map((member, index) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className="group relative"
            >
              <div className="relative overflow-hidden rounded-xl aspect-w-3 aspect-h-4">
                <img
                  src={member.image}
                  alt={member.name}
                  className="object-cover w-full h-full transform transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-center">
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      whileInView={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="space-y-3"
                    >
                      {/* Experience Badge */}
                      <div className="flex items-center justify-center gap-2 mb-3">
                        <Award className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm font-semibold text-yellow-400">
                          {member.experience}
                        </span>
                      </div>

                      {/* Speciality */}
                      <div className="flex items-center justify-center gap-2 mb-3">
                        <Star className="w-4 h-4 text-blue-400" />
                        <span className="text-sm text-blue-400">
                          {member.speciality}
                        </span>
                      </div>

                      {/* Expertise Tags */}
                      <div className="space-y-1">
                        <p className="text-xs text-gray-300 mb-2">
                          Key Expertise:
                        </p>
                        <div className="flex flex-wrap justify-center gap-1">
                          {member.expertise.map((skill, skillIndex) => (
                            <span
                              key={skillIndex}
                              className="px-2 py-1 bg-white/10 backdrop-blur-sm rounded-full text-xs text-white border border-white/20"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
              <div className="text-center mt-4">
                <h3 className="text-xl font-semibold">{member.name}</h3>
                <p className="text-gray-400">{member.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
