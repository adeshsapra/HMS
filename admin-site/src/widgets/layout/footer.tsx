import React from "react";
import { Typography } from "@material-tailwind/react";
import { HeartIcon } from "@heroicons/react/24/solid";

export interface FooterRoute {
  name: string;
  path: string;
}

export interface FooterProps {
  brandName?: string;
  brandLink?: string;
  routes?: FooterRoute[];
}

export function Footer({ 
  brandName = "Akdex Code", 
  brandLink = "#"
}: FooterProps): JSX.Element {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-8 rounded-2xl border border-blue-gray-100 bg-white/80 px-4 py-4 shadow-sm backdrop-blur-sm">
      <div className="mb-3 h-px w-full bg-gradient-to-r from-transparent via-blue-gray-200 to-transparent" />
      <div className="flex w-full flex-col items-start justify-between gap-2 md:flex-row md:items-center">
        <div>
          <Typography variant="small" className="font-semibold text-blue-gray-800">
            &copy; {year}{" "}
            <a
              href={brandLink}
              className="font-extrabold tracking-wide text-blue-700 transition-colors hover:text-blue-900"
            >
              {brandName}
            </a>
          </Typography>
          <Typography variant="small" className="text-xs font-medium text-blue-gray-500">
            HMS Admin Panel | Secure Operations Dashboard
          </Typography>
        </div>
        <Typography variant="small" className="text-xs font-medium text-blue-gray-500">
          Built with <HeartIcon className="-mt-0.5 mx-1 inline-block h-3.5 w-3.5 text-red-600" /> for better hospital workflow
        </Typography>
      </div>
    </footer>
  );
}

Footer.displayName = "/src/widgets/layout/footer.tsx";

export default Footer;

