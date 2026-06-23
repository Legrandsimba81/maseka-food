"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Mail, Phone } from "lucide-react";
import ServicesSection from "@/components/ServicesSection";
import AboutSection from "@/components/AboutSection";

export default function TeamPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/team")
      .then(res => res.json())
      .then(data => { setMembers(data); setLoading(false); });
  }, []);

  if (loading) return <div className="text-center py-8">Chargement...</div>;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-primary dark:text-white mb-4">Notre équipe</h1>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Derrière chaque pain croustillant et chaque pâtisserie savoureuse, il y a une équipe passionnée.
          Découvrez les visages de maseka food.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {members.map((member) => (
          <div key={member.id} className="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="relative h-64 w-full bg-amber-100 dark:bg-gray-700 overflow-hidden">
              {member.image ? (
                <Image src={member.image} alt={member.name} fill className="object-cover group-hover:scale-105 transition duration-500" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl text-amber-500">👤</div>
              )}
            </div>
            <div className="p-5 text-center">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1">{member.name}</h3>
              <p className="text-primary font-semibold mb-2">{member.role}</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm">{member.bio}</p>
              <div className="flex justify-center gap-3 mt-4">
                {member.email && (
                  <a href={`mailto:${member.email}`} className="text-gray-400 hover:text-primary transition">
                    <Mail size={20} />
                  </a>
                )}
                {member.phone && (
                  <a href={`https://wa.me/${member.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition">
                    <Phone size={20} />
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      <ServicesSection />
      <AboutSection />
    </div>
  );
}