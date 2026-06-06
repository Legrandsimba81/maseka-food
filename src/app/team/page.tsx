"use client";
import Image from "next/image";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaEnvelope } from "react-icons/fa";

const teamMembers = [
  { name: "Jean Kasereka", role: "Fondateur & Chef Boulanger", bio: "Passionné par la boulangerie artisanale depuis 20 ans.", image: "/images/team/jean.jpg" },
  { name: "Marie Mambo", role: "Pâtissière en chef", bio: "Spécialiste des desserts et gâteaux de mariage.", image: "/images/team/marie.jpg" },
  { name: "Luc Bwira", role: "Responsable production", bio: "Garant de la qualité et de la fraîcheur des pains.", image: "/images/team/luc.jpg" },
  { name: "Grace Kahindo", role: "Vendeuse", bio: "Accueil chaleureux et conseils personnalisés.", image: "/images/team/grace.jpg" },
  { name: "David Katembo", role: "Livraison", bio: "Vos commandes livrées rapidement et en toute sécurité.", image: "/images/team/david.jpg" },
  { name: "Esther Kavira", role: "Community Manager", bio: "Gère nos réseaux sociaux et les relations clients.", image: "/images/team/esther.jpg" },
  { name: "Samuel Kambale", role: "Boulanger", bio: "Spécialiste des pains au levain et traditionnels.", image: "/images/team/samuel.jpg" },
  { name: "Ruth Mumbere", role: "Pâtissière", bio: "Créatrice des desserts et viennoiseries.", image: "/images/team/ruth.jpg" },
  { name: "Joseph Kyusa", role: "Assistant boulanger", bio: "Passionné et apprenti boulanger.", image: "/images/team/joseph.jpg" },
  { name: "Sarah Lusi", role: "Responsable marketing", bio: "Stratégies de communication et événements.", image: "/images/team/sarah.jpg" },
  { name: "Isaac Kikuni", role: "Technicien maintenance", bio: "Veille au bon fonctionnement des équipements.", image: "/images/team/isaac.jpg" },
  { name: "Lydia Tusi", role: "Comptable", bio: "Gestion financière et administrative.", image: "/images/team/lydia.jpg" },
];

export default function TeamPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* En-tête */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-primary dark:text-white mb-4">Notre équipe</h1>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Derrière chaque pain croustillant et chaque pâtisserie savoureuse, il y a une équipe passionnée.
          Découvrez les visages de maseka food.
        </p>
      </div>

      {/* Grille des membres */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {teamMembers.map((member, idx) => (
          <div
            key={idx}
            className="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            {/* Photo */}
            <div className="relative h-64 w-full bg-amber-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
              {member.image ? (
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  className="object-cover group-hover:scale-105 transition duration-500"
                />
              ) : (
                <span className="text-6xl text-amber-500">👤</span>
              )}
            </div>
            <div className="p-5 text-center">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1">{member.name}</h3>
              <p className="text-primary font-semibold mb-2">{member.role}</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm">{member.bio}</p>
              {/* Icônes sociales avec react-icons */}
              <div className="flex justify-center gap-3 mt-4">
                <a href="#" className="text-gray-400 hover:text-primary transition" aria-label="Facebook">
                  <FaFacebook size={18} />
                </a>
                <a href="#" className="text-gray-400 hover:text-primary transition" aria-label="Twitter">
                  <FaTwitter size={18} />
                </a>
                <a href="#" className="text-gray-400 hover:text-primary transition" aria-label="Instagram">
                  <FaInstagram size={18} />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}