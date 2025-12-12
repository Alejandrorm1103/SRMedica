export const TIPOS_DOCUMENTO = [
    { id: 1, codigo: 'cc', nombre: 'Cédula de ciudadanía' },
    { id: 2, codigo: 'ce', nombre: 'Cédula de extranjería' },
    { id: 3, codigo: 'ti', nombre: 'Tarjeta de identidad' },
    { id: 4, codigo: 'nit', nombre: 'NIT' },
    { id: 5, codigo: 'pt', nombre: 'Pasaporte' },
] as const;

export const SEXOS = [
    { id: 1, codigo: 'f', nombre: 'Femenino' },
    { id: 2, codigo: 'm', nombre: 'Masculino' },
    { id: 3, codigo: 'x', nombre: 'No binario' },
    { id: 4, codigo: 'nd', nombre: 'No declara' },
] as const;

export const ROLES = [
    { id: 1, codigo: 'paciente', nombre: 'Paciente', descripcion: 'Rol de paciente que agenda y asiste a citas.' },
    { id: 2, codigo: 'medico', nombre: 'Médico', descripcion: 'Rol de médico que atiende citas y carga notas.' },
    { id: 3, codigo: 'administrador', nombre: 'Administrador', descripcion: 'Gestión operativa: usuarios, catálogos, etc.' },
] as const;

export const ESPECIALIDADES = [
    { id: 1, codigo: 'medicina_general', nombre: 'Medicina General' },
    { id: 2, codigo: 'pediatria', nombre: 'Pediatría' },
    { id: 3, codigo: 'ginecologia_obstetricia', nombre: 'Ginecología y Obstetricia' },
    { id: 4, codigo: 'medicina_interna', nombre: 'Medicina Interna' },
    { id: 5, codigo: 'cardiologia', nombre: 'Cardiología' },
    { id: 6, codigo: 'dermatologia', nombre: 'Dermatología' },
    { id: 7, codigo: 'neurologia', nombre: 'Neurología' },
    { id: 8, codigo: 'psiquiatria', nombre: 'Psiquiatría' },
    { id: 9, codigo: 'psicologia_clinica', nombre: 'Psicología Clínica' },
    { id: 10, codigo: 'otorrinolaringologia', nombre: 'Otorrinolaringología' },
    { id: 11, codigo: 'oftalmologia', nombre: 'Oftalmología' },
    { id: 12, codigo: 'endocrinologia', nombre: 'Endocrinología' },
    { id: 13, codigo: 'gastroenterologia', nombre: 'Gastroenterología' },
    { id: 14, codigo: 'neumologia', nombre: 'Neumología' },
    { id: 15, codigo: 'reumatologia', nombre: 'Reumatología' },
    { id: 16, codigo: 'urologia', nombre: 'Urología' },
    { id: 17, codigo: 'traumatologia', nombre: 'Traumatología' },
    { id: 18, codigo: 'nutricion', nombre: 'Nutrición' },
    { id: 19, codigo: 'fisioterapia', nombre: 'Fisioterapia' },
    { id: 20, codigo: 'medicina_familiar', nombre: 'Medicina Familiar' },
] as const;
