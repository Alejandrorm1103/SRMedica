import { Dialog, Transition } from "@headlessui/react";
import { LockClosedIcon } from "@heroicons/react/20/solid";
import { Button, ButtonGroup } from "@heroui/button";
import { Input } from "@heroui/react";
import { Checkbox } from "@heroui/react";
import { Select, SelectSection, SelectItem } from "@heroui/select";
import { Fragment, useState } from "react";
import { getImagePath } from "../../../lib/utils";

const Register = () => {
  let [isOpen, setIsOpen] = useState(false);

  const closeModal = () => {
    setIsOpen(false);
  };

  const openModal = () => {
    setIsOpen(true);
  };

  const sexos = [
    { key: "masculino", label: "Masculino" },
    { key: "femenino", label: "Femenino" },
  ];

  return (
    <>
      <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto  sm:pr-0">
        <div className="hidden lg:block">
          <button
            className="text-white text-lg font-medium ml-9 py-5 px-16 transition duration-150 ease-in-out leafbutton bg-lightblue hover:text-white hover:bg-blue"
            onClick={openModal}
          >
            Registrarse
          </button>
        </div>
      </div>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
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

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
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
                          alt="Your Company"
                        />
                        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
                          Registre su Cuenta
                        </h2>
                      </div>
                      <form className="mt-8 space-y-6" action="#" method="POST">
                        <input
                          type="hidden"
                          name="remember"
                          defaultValue="true"
                        />
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
                          <Select
                            isRequired
                            classNames={{
                              // 'base' solo para el margen exterior
                              base: "mt-5",
                              // 'trigger' para el campo de entrada
                              trigger: "shadow-sm hover:shadow-lg transition-shadow duration-300"// Ejemplo: estilo para el trigger/input
                            }}
                            key="secondary"
                            label="Sexo"
                            placeholder="Seleccione su Sexo"
                          >
                            {sexos.map((sexo) => (
                              <SelectItem key={sexo.key}>{sexo.label}</SelectItem>
                            ))}
                          </Select>
                        </div>

                         <div>
                          <Button 
                          color="primary" 
                          variant="ghost"
                          className="w-full">
                            Registrar
                          </Button>
                        </div>
                      </form>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 "
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

export default Register;
