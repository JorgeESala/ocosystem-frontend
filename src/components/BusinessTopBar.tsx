import { useLocation, useNavigate } from "react-router-dom";
import { Dropdown, DropdownItem } from "flowbite-react";
import { HiChevronDown, HiOutlineHome } from "react-icons/hi";
import { useAuth } from "@/context/AuthContext";
import { BUSINESSES } from "@/business/business.config";
import {
  buildBreadcrumbs,
  findCurrentBusiness,
} from "@/business/business.breadcrumbs";

export default function BusinessTopBar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const allowed = BUSINESSES.filter((business) =>
    user?.allowedBusinesses.includes(business.key),
  );
  const current = findCurrentBusiness(pathname, allowed);

  if (!current) return null;

  const Icon = current.icon;
  const crumbs = buildBreadcrumbs(pathname, current);
  const hasMultiple = allowed.length > 1;

  return (
    <div className="sticky top-0 z-30 -mx-2 mb-4 border-b border-slate-800 bg-gray-900/95 px-8 py-2 backdrop-blur md:-mx-0 md:px-6">
      <div className="flex flex-wrap items-center gap-2">
        {hasMultiple ? (
          <Dropdown
            dismissOnClick
            renderTrigger={() => (
              <button
                type="button"
                aria-label="Cambiar unidad de negocio"
                className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800"
              >
                <Icon className="h-4 w-4 text-blue-400" />
                <span className="max-w-[10rem] truncate">{current.name}</span>
                <HiChevronDown className="h-4 w-4 text-slate-400" />
              </button>
            )}
          >
            {allowed.map((business) => {
              const BusinessIcon = business.icon;
              return (
                <DropdownItem
                  key={business.slug}
                  icon={BusinessIcon}
                  onClick={() => navigate(`/business/${business.slug}`)}
                >
                  {business.name}
                </DropdownItem>
              );
            })}
            <div className="my-1 h-px bg-slate-700" />
            <DropdownItem icon={HiOutlineHome} onClick={() => navigate("/")}>
              Ver todas las unidades
            </DropdownItem>
          </Dropdown>
        ) : (
          <div className="flex items-center gap-2 px-2 py-1.5 text-sm font-medium text-white">
            <Icon className="h-4 w-4 text-blue-400" />
            {current.name}
          </div>
        )}

        <nav
          aria-label="Ruta de navegación"
          className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto text-xs whitespace-nowrap text-slate-500"
        >
          {crumbs.map((crumb, index) => (
            <span
              key={`${crumb.label}-${index}`}
              className="flex items-center gap-1"
            >
              {index > 0 && <span aria-hidden>/</span>}
              <span
                className={
                  index === crumbs.length - 1
                    ? "font-medium text-slate-300"
                    : undefined
                }
              >
                {crumb.label}
              </span>
            </span>
          ))}
        </nav>
      </div>
    </div>
  );
}
