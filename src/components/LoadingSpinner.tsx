import Image from "next/image";

interface LoadingSpinnerProps {
  fullPage?: boolean;
  message?: string;
}

export default function LoadingSpinner({ fullPage = true, message = "Chargement..." }: LoadingSpinnerProps) {
  return (
    <div className={`${fullPage ? "fixed inset-0" : "w-full"} flex flex-col items-center justify-center bg-white dark:bg-gray-900 z-50`}>
      <div className="relative">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-4 border-amber-500 border-t-transparent"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Image src="/images/favicon.icon.png" alt="Logo" width={32} height={32} className="object-contain" />
        </div>
      </div>
      <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">{message}</p>
    </div>
  );
}