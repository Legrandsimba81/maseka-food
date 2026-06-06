// src/components/PromoCard.tsx
import Link from "next/link";

interface PromoCardProps {
  imageSrc: string;
  imageAlt?: string;
  title: string;
  productId?: string;
  linkHref?: string;
  buttonText?: string;
  description?: string;
  className?: string;
}

export default function PromoCard({
  imageSrc,
  imageAlt = "Promotion",
  title,
  productId,
  linkHref,
  buttonText = "Voir les détails",
  description = "",
  className = "",
}: PromoCardProps) {
  let href = linkHref;
  if (productId) href = `/products/${productId}`;
  else if (!href) href = "/products";

  return (
    <div className={`w-full ${className}`}>
      <div className="lg:w-[1000px]
    min-[1200px]:max-[1360px]:w-[900px]
    min-[1190px]:max-[1199px]:w-[800px]
    min-[960px]:max-[1189px]:w-[700px]
    min-[830px]:max-[959px]:w-[600px]
    min-[700px]:max-[829px]:w-[500px]
    min-[500px]:max-[699px]:w-[400px]
    min-[200px]:max-[499px]:w-[400px]]  
    bg-gradient-to-r from-[#d19268] to-[#ffe1c1] dark:from-gray-600 dark:to-gray-800 rounded-2xl overflow-hidden shadow-lg flex flex-row">
        <div className="relative w-full
         h-48 
         sm:h-56 
         md:h-64 
         min-[700px]:max-[829px]:h-43 
         min-[500px]:max-[699px]:h-32 
         min-[200px]:max-[499px]:h-24 
         overflow-hidden"
        >
          <img src={imageSrc} alt={imageAlt} className="w-full h-full object-cover" />
        </div>
        <div className="md:w-[600px] min-[700px]:max-[829px]:w-[400px] min-[500px]:max-[699px]:w-[400px] min-[200px]:max-[499px]:w-[400px] p-4 my-auto">
          <h3 className="text-xl md:text-2xl font-bold text-[#6d4429] dark:text-white mb-2 line-clamp-2">
            {title}
          </h3>
          {description && (
            <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 mb-4 line-clamp-3 flex-grow">
              {description}
            </p>
          )}
          <Link
            href={href}
            className="inline-block bg-[#6d4429] hover:bg-orange-800 text-white dark:bg-gray-900 dark:hover:bg-gray-800 rounded-xl px-4 py-2 text-center text-sm md:text-base transition"
          >
            {buttonText}
          </Link>
        </div>
      </div>
    </div>
  );
}