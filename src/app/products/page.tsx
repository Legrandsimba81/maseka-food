"use client";
import { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";
import BackButton from "@/components/BackButton";
import { Funnel } from "lucide-react";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    fetch("/api/products")
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setFilteredProducts(data);
      });
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [searchTerm, products]);

  return (
    <div className="container-custom py-8 dark:bg-gray-900">
      <BackButton />
      <div className="flex justify-between mb-6">
        
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold mb-6">Nos produits</h1>
        </div>

        <div className="flex gap-2 mb-6 items-center">
                     
          <input
            type="text"
            placeholder="Rechercher un produit..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field max-w-md"
            autoFocus
          />
          <div className="w-full text-center px-5 py-2 bg-orange-500 text-white rounded-md items-center">
            Filtre Produits
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product: any) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}