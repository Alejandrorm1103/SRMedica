import { Dialog, Transition } from "@headlessui/react";
import { LockClosedIcon } from "@heroicons/react/20/solid";
import { Checkbox } from "@heroui/react"; // Componente de HeroUI
import {Button, ButtonGroup} from "@heroui/button";
import { Input } from "@heroui/react";
import { Fragment, useState } from "react";
import { getImagePath } from "../../../lib/utils";

const Signin = () => {
  let [isOpen, setIsOpen] = useState(false);

  const closeModal = () => {
    setIsOpen(false);
  };

  const openModal = () => {
    setIsOpen(true);
  };


  return (
    <>
      <div className="absolute inset-y-0 right-0 flex items-center sm:static sm:inset-auto sm:pr-0">
        <div className="hidden lg:block">
          <button
            type="button"
            className="text-lg text-blue font-medium"
            onClick={openModal}
          >
            Iniciar Sesión
          </button>
        </div>
      </div>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          {/* 1. Backdrop */}
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          {/* 2. Content Wrapper */}
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              {/* 3. Dialog Panel (The actual Modal content) */}
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <div className="flex min-h-full items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                    <div className="w-full max-w-md space-y-8">
                      <div>
                        <img
                          className="mx-auto h-12 w-auto"
                          src={getImagePath("/assets/logo/logo.png")}
                          alt="Company"
                        />
                        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
                          Inicia Sesión en tu Cuenta
                        </h2>
                      </div>
                      <form className="mt-8 space-y-6" action="#" method="POST">
                        <input
                          type="hidden"
                          name="remember"
                          defaultValue="true"
                        />
                        {/* Usamos un div para el contenedor de los Inputs */}
                        <div className="">
                          {/* Input de Correo */}
                          <div>
                            <Input
                              isRequired
                              classNames={{
                                inputWrapper: [
                                  "shadow-sm", // Sombra pequeña por defecto (si la quieres constante)
                                  "hover:shadow-md", // Sombra más grande al pasar el mouse
                                  // Clases para la unificación del Input (sin borde inferior)
                                ],
                              }}
                              label="Correo"
                              type="email"
                              key="secondary"
                            />
                          </div>

                          {/* Input de Contraseña (Recomendación: usar Input de HeroUI también) */}
                          <div>
                            <Input
                              isRequired
                              classNames={{
                                inputWrapper: [
                                  "shadow-sm", // Sombra pequeña por defecto (si la quieres constante)
                                  "hover:shadow-md", // Sombra más grande al pasar el mouse
                                  "mt-5"
                                ],
                              }}
                              label="Contraseña"
                              type="password"
                              key="secondary"
                            />
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          {/* Agrupamos el Checkbox para mantenerlo pegado al lado izquierdo */}
                          <div className="flex items-center">
                            {/* 1. Ponemos el texto DENTRO del Checkbox. 
      2. El color="primary" ahora sí funcionará.
      3. Eliminamos el <label> de HTML separado.
    */}
                            <Checkbox
                              defaultSelected={true}
                              color="primary"
                            // Si quieres ajustar el tamaño, usa la prop 'size' (sm, md, lg) en lugar de className="h-4 w-4"
                            >
                              Recordarme
                            </Checkbox>
                          </div>

                          {/* El componente de enlace ya está bien. Se alinea al otro extremo gracias a justify-between */}
                          <div className="text-sm">
                            <a
                              href="#"
                              className="font-medium text-indigo-600 hover:text-indigo-500"
                            >
                              ¿Olvidaste la contraseña?
                            </a>
                          </div>
                        </div>

                        <div>
                          <Button 
                          color="primary" 
                          variant="ghost"
                          className="w-full">
                            Iniciar Sesión
                          </Button>
                        </div>
                      </form>
                    </div>
                  </div>

                  {/* Botón de Cierre (Lo coloqué DENTRO del Dialog.Panel para mejor UX) */}
                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={closeModal}
                    >
                      Lo tengo, ¡Gracias!
                    </button>
                  </div>

                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default Signin;