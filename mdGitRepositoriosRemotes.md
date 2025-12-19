# Guía de Git para Repositorio Principal y Repositorio Pasante

Esta guía resume todo lo mencionado en la conversación sobre **gestión de commits, ramas, remotes y flujo de trabajo** con un repositorio principal y un repositorio pasante.

---

## 1. Eliminar commits local y remoto

### 1.1 Commit local no push

- Manteniendo cambios:

```bash
git reset --soft HEAD~1
```

- Eliminando cambios:

```bash
git reset --hard HEAD~1
```

### 1.2 Commit ya push

- Reset local:

```bash
git reset --hard HEAD~1
```

- Push forzado al remoto:

```bash
git push origin main --force
```

### 1.3 Commit específico (no último)

```bash
git rebase -i HEAD~5
```

- Cambiar `pick` por `drop` en la línea del commit que quieres eliminar.
- Luego:

```bash
git push origin main --force
```

### 1.4 Forma segura (no borra historial)

```bash
git revert <hash_del_commit>
git push origin main
```

---

## 2. Evitar push directo a main

### Protección de ramas (GitHub)

1. Settings → Branches → Add branch protection rule.
2. Branch name: `main`
3. Marcar opciones:
   - Require a pull request before merging
   - Require approvals
   - Include administrators (opcional)
   - Restrict who can push (opcional, para solo tu usuario)

### Flujo recomendado

```bash
git checkout -b feature/nueva-funcionalidad
git push origin feature/nueva-funcionalidad
# Luego Pull Request → main
```

---

## 3. Unir dos repositorios en GitHub

### 3.1 Usar repo B dentro de A con subtree

```bash
git remote add repoB https://github.com/usuario/repoB.git
git fetch repoB
git subtree add --prefix=repoB repoB main --squash
```

### 3.2 Conservar historial con merge

```bash
git remote add repoB https://github.com/usuario/repoB.git
git fetch repoB
git merge repoB/main --allow-unrelated-histories
```

### 3.3 Solo copiar código sin historial

```bash
cp -r repoB/* repoA/
git add .
git commit -m "Unir repoB en repoA"
```

### 3.4 Submódulos (avanzado)

```bash
git submodule add https://github.com/usuario/repoB.git
```

---

## 4. Flujo recomendado para repositorio principal + pasante

### 4.1 Configurar remotes

```bash
# En repo A (principal)
git remote add pasante https://github.com/usuario/repo-pasante.git
```

### 4.2 Trabajar en repo pasante

```bash
git checkout -b feature/nueva-funcionalidad
# Hacer cambios
git commit -m "Cambios X"
git push origin feature/nueva-funcionalidad
```

### 4.3 Traer cambios de pasante a A

```bash
cd repoA
git fetch pasante
git merge pasante/feature/nueva-funcionalidad
git push origin main
```

### 4.4 Flujo recomendado con ramas

- Mantener `main` limpio
- Crear ramas feature en pasante para desarrollo
- Merge a repo principal solo cuando estén listos los cambios

---

## 5. Conceptos de remotes

- Un repo puede tener **muchos remotes**, no hay límite práctico.
- Comandos:

```bash
git remote -v        # Ver remotes
git remote add nombre URL  # Agregar
```

- Nombres comunes:
  - `origin` → repo principal
  - `pasante` → repo de desarrollo/pasante
  - `upstream` → repo fuente de terceros

---

## 6. Usar SSH en lugar de HTTPS

```bash
git remote add pasante git@github.com:aycaRichard12/cm-oficial.gitenves
```

- Requiere clave SSH configurada en tu máquina y GitHub.
- Ventaja: no pide usuario/contraseña cada vez.

---

## 7. Git fetch y ramas

- `git fetch <remote>` **se puede hacer desde cualquier rama local**.
- Solo descarga commits y ramas del remote, **no cambia tu rama actual**.
- Para aplicar cambios:

```bash
git checkout develop
 git fetch pasante
 git merge pasante/main
```

- `git pull` = `fetch + merge` automático

---

## 8. Visual Studio Code y remotes

- La ventana **Source Control** muestra:
  - Commits locales
  - Ramas locales
  - Merge / Rebase
- **No muestra remotes directamente**
- Para ver remotes:

```bash
git remote -v
```

- Alternativas visuales:
  - Extensión **Git Graph**
  - Terminal integrado con `git fetch` y `git merge`

---

## 9. Buenas prácticas

- Mantener `main` limpio en ambos repositorios
- Trabajar siempre en ramas `feature/*` en el pasante
- Usar nombres descriptivos para remotes y ramas
- Proteger `main` en el repositorio principal
- Usar SSH para mayor comodidad y seguridad

---

## 10. Flujo visual resumido

```
Repo Principal (main)
       ↑ merge
       │
Repo Pasante (feature/*)
       ↑ push
       │
Local (tu máquina)
```
