# Guía de Commits Profesionales

**guía práctica y sencilla** para lograrlo.

---

## 1️⃣ Estructura recomendada de un commit

La forma más usada (y profesional) es:

```
<tipo>(opcional-alcance): descripción corta

(opcional) cuerpo del mensaje
(opcional) referencias
```

### Ejemplo simple

```
feat: agregar validación de formulario de ventas
```

### Ejemplo más completo

```
fix(auth): corregir error al validar token expirado

El backend devolvía 401 incluso con token válido.
Se ajustó la lógica de expiración.
```

---

## 2️⃣ Tipos de commit más usados (Convencional Commits)

Usa siempre uno de estos **tipos estándar**:

| Tipo       | Uso                                          |
| ---------- | -------------------------------------------- |
| `feat`     | Nueva funcionalidad                          |
| `fix`      | Corrección de bug                            |
| `refactor` | Reestructuración sin cambiar comportamiento  |
| `style`    | Cambios de formato (espacios, tabs, ;, etc.) |
| `docs`     | Documentación                                |
| `test`     | Pruebas                                      |
| `chore`    | Tareas menores (config, build, deps)         |
| `perf`     | Mejora de rendimiento                        |

### Ejemplos reales

```
feat(pedidos): permitir pedidos con stock cero en cotización
fix(menu): evitar error al cargar permisos desde localStorage
refactor(api): centralizar llamadas axios
docs: actualizar manual de usuario
```

---

## 3️⃣ Reglas de oro para escribir commits

### ✔ Usa verbo en infinitivo

❌ `agregado botón de guardar`
✅ `agregar botón de guardar`

### ✔ No más de 50 caracteres en el título

```
feat: agregar filtro por almacén
```

### ✔ No uses punto final

❌ `fix: corregir error.`
✅ `fix: corregir error`

### ✔ Un commit = un cambio lógico

❌ arreglar bug + cambiar estilos + renombrar variables
✅ commits separados

---

## 4️⃣ Commits con cuerpo (cuando el cambio es importante)

Cuando el cambio no es obvio:

```bash
git commit -m "fix(ventas): corregir cálculo de total" \
-m "El total se calculaba sin considerar el descuento.
Ahora se aplica antes del IVA."
```

O con editor:

```bash
git commit
```

---

## 5️⃣ Ejemplos adaptados a TU contexto (Quasar / Vue / Backend)

```
feat(cotizacion): permitir venta o cotización desde selector
fix(router): mostrar ruta en la barra del navegador
refactor(menu): desacoplar lógica de permisos del layout
chore: actualizar dependencias de Quasar
```

---

## 6️⃣ Convención recomendada para equipos

Si trabajas solo o en equipo, sigue **Convencional Commits** 👉
[https://www.conventionalcommits.org](https://www.conventionalcommits.org)

Es compatible con:

- changelog automático
- versionado semántico
- CI/CD

---

## 7️⃣ Opcional: forzar commits profesionales (nivel PRO)

### 🔒 Commitizen

Te guía paso a paso:

```bash
npm install -g commitizen
commitizen init cz-conventional-changelog --save-dev --save-exact
git cz
```

---

### 🔒 Husky (evitar commits malos)

Bloquea commits mal escritos.

---

## 8️⃣ Plantilla rápida (para copiar)

```
feat(scope): descripción clara y corta

Explicar qué se hizo y por qué
(si no es obvio).
```

---

### Opciones extra

Si quieres, puedo:

- 🔹 Crear una **convención exacta** para tu proyecto
- 🔹 Revisar tus últimos commits y mejorarlos
- 🔹 Configurar **commitizen + husky** paso a paso
