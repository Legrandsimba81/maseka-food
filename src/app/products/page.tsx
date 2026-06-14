"use client";
import { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";
import { Search, Cake, Coffee, Sandwich, Pizza, Beef, Croissant, Candy, Egg, X } from "lucide-react";

// Catégories selon votre seed
const categories = [
  { id: "all", label: "Tous", icon: null },
  { id: "pains", label: "Pains", icon: Egg },
  { id: "pâtisseries", label: "Gâteaux", icon: Cake },
  { id: "viennoiseries", label: "Viennoiseries", icon: Croissant },
  { id: "sandwichs", label: "Sandwichs", icon: Sandwich },
  { id: "pizzas", label: "Pizzas", icon: Pizza },
  { id: "burgers", label: "Burgers", icon: Beef },
  { id: "snacks", label: "Snacks", icon: Candy },
  { id: "boissons", label: "Boissons", icon: Coffee },
];

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    fetch("/api/products")
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setFilteredProducts(data);
      });
  }, []);

  useEffect(() => {
    let filtered = products;
    if (activeCategory !== "all") {
      filtered = filtered.filter(p => p.category === activeCategory);
    }
    if (searchTerm.trim()) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredProducts(filtered);
  }, [activeCategory, searchTerm, products]);

  const resetFilters = () => {
    setSearchTerm("");
    setActiveCategory("all");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* <h1 className="text-2xl md:text-3xl md:font-bold mb-6 text-center">Bienvenue sur <br className="md:hidden"/>le menu maseka food</h1> */}
      <div className="sticky top-20 z-10 pb-4">
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="Rechercher un produit..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pr-10"
          />
          <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {/* Filtres + recherche */}
      <div className="flex flex-col md:flex-wrap lg:flex-row gap-4 mb-8">
        <div className="flex flex-wrap gap-2 items-center">
          {categories.map(cat => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition ${isActive
                    ? "bg-primary text-white"
                    : "bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700"
                  }`}
              >
                {Icon && <Icon size={16} />}
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {(activeCategory !== "all" || searchTerm) && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gray-200 dark:bg-gray-700 text-sm"
          >
            <X size={16} /> Réinitialiser
          </button>
        )}
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500">Aucun produit ne correspond à votre recherche.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}