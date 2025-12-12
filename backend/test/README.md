# 🧪 Tests - SR Medica Backend

Esta carpeta contiene todos los tests del proyecto, organizados por tipo.

---

## 📁 Estructura

```
test/
├── unit/              # Tests unitarios
│   └── utils/         # Tests de utilidades
│       ├── pagination.util.test.ts
│       └── response.util.test.ts
│
└── e2e/               # Tests end-to-end
    └── endpoints/     # Tests de endpoints
        └── test-endpoints/  # Endpoints de testing/debugging
            ├── index.ts
            └── test.routes.ts
```

---

## 📋 Tipos de Tests

### **🔹 Unit Tests (`test/unit/`)**
Tests unitarios que prueban funciones y utilidades de forma aislada.

**Ubicación:** `test/unit/`

**Archivos:**
- `utils/pagination.util.test.ts` - Tests de utilidades de paginación
- `utils/response.util.test.ts` - Tests de utilidades de respuesta

**Ejecutar:**
```bash
npm test
```

---

### **🔹 E2E Tests (`test/e2e/`)**
Tests end-to-end que prueban flujos completos de la aplicación.

**Ubicación:** `test/e2e/`

**Archivos:**
- `endpoints/test-endpoints/` - Endpoints especiales para testing y debugging
  - Solo disponibles en desarrollo (`NODE_ENV !== 'production'`)
  - Incluyen endpoints para probar autenticación, base de datos, etc.

---

## 🚀 Comandos

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests en modo watch
npm test -- --watch

# Ejecutar tests con coverage
npm test -- --coverage

# Ejecutar solo tests unitarios
npm test -- test/unit

# Ejecutar solo tests e2e
npm test -- test/e2e
```

---

## 📝 Convenciones

### **Nombres de Archivos**
- Tests unitarios: `*.test.ts`
- Tests e2e: `*.e2e.test.ts` (futuro)

### **Estructura de Tests**
```typescript
import { describe, it, expect } from 'vitest';

describe('NombreDelModulo', () => {
  describe('nombreDeLaFuncion', () => {
    it('debería hacer X cuando Y', () => {
      // Arrange
      const input = ...;
      
      // Act
      const result = funcionAProbar(input);
      
      // Assert
      expect(result).toBe(expected);
    });
  });
});
```

---

## 🎯 Cobertura Actual

```
Test Files:  2 passed (2)
Tests:       13 passed (13)
Coverage:    TBD
```

---

## 📚 Próximos Tests a Agregar

### **Unit Tests**
- [ ] `test/unit/utils/date.util.test.ts`
- [ ] `test/unit/utils/jwt.util.test.ts`
- [ ] `test/unit/utils/rbac.util.test.ts`

### **Integration Tests**
- [ ] `test/integration/auth/login.test.ts`
- [ ] `test/integration/auth/register.test.ts`
- [ ] `test/integration/users/crud.test.ts`

### **E2E Tests**
- [ ] `test/e2e/flows/patient-registration.e2e.test.ts`
- [ ] `test/e2e/flows/appointment-booking.e2e.test.ts`
- [ ] `test/e2e/flows/doctor-consultation.e2e.test.ts`

---

## 🔧 Configuración

Los tests están configurados en:
- `vitest.config.ts` - Configuración de Vitest
- `tsconfig.eslint.json` - Configuración de TypeScript para tests
- `package.json` - Scripts de npm

---

## ✅ Mejores Prácticas

1. ✅ **Tests aislados** - Cada test debe ser independiente
2. ✅ **Nombres descriptivos** - Usar `it('debería...')`
3. ✅ **AAA Pattern** - Arrange, Act, Assert
4. ✅ **Un concepto por test** - No probar múltiples cosas
5. ✅ **Mocks cuando sea necesario** - Aislar dependencias externas
6. ✅ **Cleanup** - Limpiar después de cada test
