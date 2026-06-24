"use client";

interface SkeletonLoaderProps {
  type?:
    | "home"
    | "products"
    | "profile"
    | "cart"
    | "orders"
    | "reservations"
    | "article"
    | "admin"
    | "admin-orders"
    | "admin-products"
    | "team"
    | "promotions"
    | "default";
  count?: number;
}

export default function SkeletonLoader({ type = "default", count = 4 }: SkeletonLoaderProps) {
  const renderSkeletons = (height: string, count: number, className = "") => {
    return Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className={`${height} bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse ${className}`}
      ></div>
    ));
  };

  // Pour les grilles de produits, articles, etc.
  const renderGrid = (cols: string, count: number, height: string) => {
    return (
      <div className={`grid ${cols} gap-6`}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className={`${height} bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse`}></div>
        ))}
      </div>
    );
  };

  switch (type) {
    case "home":
      return (
        <div className="container mx-auto px-4 py-8 space-y-8">
          {/* Hero skeleton */}
          <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse"></div>
          {/* Section produits vedettes */}
          <div>
            <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-6 animate-pulse"></div>
            {renderGrid("grid-cols-1 sm:grid-cols-2 lg:grid-cols-4", 4, "h-72")}
          </div>
          {/* Section articles */}
          <div>
            <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-6 animate-pulse"></div>
            {renderGrid("grid-cols-1 md:grid-cols-2", 2, "h-64")}
          </div>
        </div>
      );

    case "products":
      return (
        <div className="container mx-auto px-4 py-8">
          {/* Barre de recherche */}
          <div className="h-12 w-full max-w-md bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse mb-6"></div>
          {/* Filtres */}
          <div className="flex gap-2 mb-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-9 w-16 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
            ))}
          </div>
          {/* Grille produits */}
          {renderGrid("grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4", count || 8, "h-80")}
        </div>
      );

    case "profile":
      return (
        <div className="container mx-auto px-4 py-8">
          {/* En-tête profil */}
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-8 p-4 border-2 rounded-xl animate-pulse">
            <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
            <div className="h-10 w-40 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          </div>
          {/* Grille profil */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
              <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
            </div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
          </div>
        </div>
      );

    case "cart":
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-4 p-4 border rounded-xl animate-pulse">
                  <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-4 w-1/3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="flex gap-2">
                      <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="h-8 w-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                  </div>
                  <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              ))}
            </div>
            <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
          </div>
        </div>
      );

    case "orders":
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-6 animate-pulse"></div>
          {renderGrid("grid-cols-1 md:grid-cols-2", count || 4, "h-48")}
        </div>
      );

    case "reservations":
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="h-8 w-56 bg-gray-200 dark:bg-gray-700 rounded mb-6 animate-pulse"></div>
          {renderGrid("grid-cols-1 md:grid-cols-2", count || 4, "h-40")}
        </div>
      );

    case "article":
      return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse mb-8"></div>
          <div className="h-10 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-4 animate-pulse"></div>
          <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded mb-6 animate-pulse"></div>
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
            ))}
          </div>
          <div className="h-12 w-32 bg-gray-200 dark:bg-gray-700 rounded-full mt-8 animate-pulse"></div>
        </div>
      );

    case "admin":
      return (
        <div className="p-6 space-y-8">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
          </div>
        </div>
      );

    case "admin-orders":
      return (
        <div className="p-6">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-6 animate-pulse"></div>
          <div className="flex gap-4 mb-6">
            <div className="h-10 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-10 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
          {renderGrid("grid-cols-1 md:grid-cols-2", count || 4, "h-56")}
        </div>
      );

    case "admin-products":
      return (
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
          <div className="h-10 w-64 bg-gray-200 dark:bg-gray-700 rounded mb-6 animate-pulse"></div>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      );

    case "team":
      return (
        <div className="container mx-auto px-4 py-12">
          <div className="h-12 w-64 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-4 animate-pulse"></div>
          <div className="h-6 w-96 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-12 animate-pulse"></div>
          {renderGrid("grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4", count || 4, "h-96")}
        </div>
      );

    case "promotions":
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="h-12 w-64 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-4 animate-pulse"></div>
          <div className="h-6 w-96 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-12 animate-pulse"></div>
          {renderGrid("grid-cols-1 sm:grid-cols-2 lg:grid-cols-3", count || 6, "h-72")}
        </div>
      );

    default:
      return (
        <div className="container mx-auto px-4 py-8 space-y-4">
          {Array.from({ length: count || 4 }).map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
          ))}
        </div>
      );
  }
}