"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { X, Search } from "lucide-react";
import {
  Wheat,
  Croissant,
  Cake,
  Sandwich,
  Pizza,
  Hamburger,
  Popcorn,
  Coffee,
} from "lucide-react";

const iconMap = {
  Wheat,
  Croissant,
  Cake,
  Sandwich,
  Pizza,
  Hamburger,
  Popcorn,
  Coffee,
};

export interface CategoryWithIcon {
  id: string;
  label: string;
  icon: keyof typeof iconMap; // assure que icon est une clé valide de iconMap
}

interface ProductFiltersProps {
  categoriesWithIcons: readonly CategoryWithIcon[]; // accepter un tableau readonly (as const)
  currentCategory: string;
  currentSearch: string;
}

export function ProductFilters({
  categoriesWithIcons,
  currentCategory,
  currentSearch,
}: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [searchInput, setSearchInput] = useState(currentSearch);

  useEffect(() => {
    setSearchInput(currentSearch);
  }, [currentSearch]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchInput) params.set("search", searchInput);
    if (currentCategory) params.set("category", currentCategory);
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleCategoryClick = (categoryId: string) => {
    const params = new URLSearchParams();
    if (searchInput) params.set("search", searchInput);
    if (categoryId && categoryId !== "all") params.set("category", categoryId);
    router.push(`${pathname}?${params.toString()}`);
  };

  const resetFilters = () => {
    setSearchInput("");
    router.push(pathname);
  };

  return (
    <div className="space-y-4">
      {/* Barre de recherche */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Rechercher par nom ou description..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="input-field w-full pl-10"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </div>
        <button type="submit" className="btn-primary">Rechercher</button>
      </form>

      {/* Filtres par catégorie */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => handleCategoryClick("all")}
          className={`px-3 py-1.5 rounded-full text-sm transition ${
            !currentCategory
              ? "bg-primary text-white"
              : "bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700"
          }`}
        >
          Toutes
        </button>
        {categoriesWithIcons.map((cat) => {
          const Icon = iconMap[cat.icon]; // cat.icon est déjà une clé valide
          const isActive = currentCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.id)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition ${
                isActive
                  ? "bg-primary text-white"
                  : "bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700"
              }`}
            >
              {Icon && <Icon size={16} />}
              <span>{cat.label}</span>
            </button>
          );
        })}
        {(currentCategory || currentSearch) && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gray-200 dark:bg-gray-700 text-sm"
          >
            <X size={16} /> Réinitialiser
          </button>
        )}
      </div>
    </div>
  );
}