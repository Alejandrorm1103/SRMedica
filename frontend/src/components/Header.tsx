import { Menu, Transition } from "@headlessui/react";
import { Bars3Icon, UserCircleIcon } from "@heroicons/react/24/outline";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import React, { useEffect, useState, Fragment } from "react";
import { useAuth } from "../context/AuthContext";

interface HeaderProps {
  onNavigate: (page: string) => void;
  currentPage?: string;
}

interface NavigationItem {
  name: string;
  page: string;
  current: boolean;
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export function Header({ onNavigate, currentPage }: HeaderProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  // Detectar scroll para aplicar clase sticky
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    document.documentElement.setAttribute("data-scroll", window.scrollY > 0 ? "1" : "0");

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-scroll", scrolled ? "1" : "0");
  }, [scrolled]);

  // Definir opciones de navegación
  const getNavItems = (): NavigationItem[] => {
    if (!isAuthenticated || !user) {
      return [];
    }

    switch (user.role) {
      case "medico":
        return [
          { name: "Home Médico", page: "home-medico", current: currentPage === "home-medico" },
        ];
      case "paciente":
        return [
          { name: "Home Paciente", page: "home-paciente", current: currentPage === "home-paciente" },
        ];
      case "administrador":
        return [
          { name: "Panel Admin", page: "dashboard", current: currentPage === "dashboard" }
        ];
      default:
        return [];
    }
  };

  const navigation = getNavItems();

  const handleLogout = () => {
    logout();
    onNavigate("landing");
  };

  return (
    <nav className={`navbar ${currentPage !== 'landing' ? 'bg-white shadow-md' : ''}`}>
      <div className="mx-auto max-w-7xl px-6 lg:py-4 lg:px-8">
        <div className="relative flex h-20 items-center justify-between">
          <div className="flex flex-1 items-center sm:items-stretch sm:justify-start">
            {/* LOGO */}
            <div className="flex flex-shrink-0 items-center cursor-pointer" onClick={() => onNavigate("landing")}>
              <img
                className="h-10 w-auto object-cover"
                src="/assets/logo/logo.png"
                alt="SRMedica"
              />
            </div>

            {/* LINKS */}
            <div className="hidden lg:block m-auto">
              <div className="flex space-x-4">
                {navigation.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => onNavigate(item.page)}
                    className={classNames(
                      item.current
                        ? "text-black hover:opacity-100"
                        : "hover:text-black hover:opacity-100",
                      "px-3 py-4 text-lg font-normal opacity-75 space-links cursor-pointer"
                    )}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* AUTH BUTTONS */}
          {isAuthenticated && user ? (
            <div className="hidden lg:flex items-center gap-4">
              <Menu as="div" className="relative ml-3">
                <div>
                  <Menu.Button className="flex items-center gap-2 rounded-full bg-white p-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer">
                    <span className="sr-only">Abrir menú de usuario</span>
                    <div className="flex items-center gap-2 px-2">
                      <UserCircleIcon className="h-8 w-8 text-gray-400" aria-hidden="true" />
                      <span className="text-sm font-medium text-gray-700">{user.email}</span>
                      <ChevronDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                  </Menu.Button>
                </div>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => {
                            onNavigate('profile');
                          }}
                          className={classNames(active ? 'bg-gray-100' : '', 'block w-full text-left px-4 py-2 text-sm text-gray-700 cursor-pointer')}
                        >
                          Mi Perfil
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={handleLogout}
                          className={classNames(active ? 'bg-gray-100' : '', 'block w-full text-left px-4 py-2 text-sm text-gray-700 cursor-pointer')}
                        >
                          Cerrar Sesión
                        </button>
                      )}
                    </Menu.Item>
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>
          ) : (
            <div className="hidden lg:flex items-center gap-4">
              <button
                className="text-lg text-blue font-medium cursor-pointer"
                onClick={() => onNavigate("login")}
              >
                Iniciar Sesión
              </button>
              <button
                className="text-white text-lg font-medium py-3 px-8 transition duration-150 ease-in-out leafbutton bg-lightblue hover:bg-blue cursor-pointer"
                onClick={() => onNavigate("register")}
              >
                Registrarse
              </button>
            </div>
          )}

          {/* DRAWER ICON FOR MOBILE */}
          <div className="block lg:hidden">
            <Bars3Icon
              className="block h-6 w-6 cursor-pointer"
              aria-hidden="true"
            />
          </div>
        </div>
      </div>
    </nav>
  );
}
