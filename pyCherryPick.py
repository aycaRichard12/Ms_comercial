import subprocess
import tkinter as tk
from tkinter import ttk, messagebox
import json
import os
from datetime import datetime

# ---------------- CONFIG ----------------
REMOTE = "pasante"
BRANCH = "main"
DEFAULT_LIMIT = 5
MAX_DIFF_CHARS = 50000 
HISTORY_FILE = "cherry_pick_history.json"

# --------------------------------------

def run_git(cmd):
    """Ejecuta comandos git y retorna el resultado o el error."""
    try:
        res = subprocess.run(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            encoding="utf-8",
            errors="replace",
            check=True
        )
        return res.stdout, True
    except subprocess.CalledProcessError as e:
        return e.stderr, False
def save_to_history(commit_hash, commit_msg):
    """Guarda el registro del cherry-pick en un archivo JSON."""
    new_entry = {
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "hash": commit_hash,
        "message": commit_msg,
        "remote": REMOTE,
        "branch": BRANCH
    }

    history = []
    if os.path.exists(HISTORY_FILE):
        try:
            with open(HISTORY_FILE, "r", encoding="utf-8") as f:
                history = json.load(f)
        except json.JSONDecodeError:
            history = []

    history.append(new_entry)

    with open(HISTORY_FILE, "w", encoding="utf-8") as f:
        json.dump(history, f, indent=4, ensure_ascii=False)

def fetch():
    output, success = run_git(["git", "fetch", REMOTE])
    if not success:
        messagebox.showerror("Error de Conexión", f"No se pudo hacer fetch de {REMOTE}:\n{output}")
    return success

def load_commits():
    commits_list.delete(0, tk.END)
    clear_diff()

    if not fetch(): return

    limit = limit_var.get()
    if not limit.isdigit():
        messagebox.showerror("Error", "La cantidad debe ser un número")
        return

    output, success = run_git([
        "git", "log", f"{REMOTE}/{BRANCH}",
        "--oneline", "-n", limit
    ])

    if not output.strip() or not success:
        messagebox.showwarning("Aviso", "No se encontraron commits o el remoto/rama no existe.")
        return

    for line in output.strip().split("\n"):
        commits_list.insert(tk.END, line)

def clear_diff():
    diff_text.config(state=tk.NORMAL)
    diff_text.delete("1.0", tk.END)
    diff_text.config(state=tk.DISABLED)

def show_diff(event):
    selection = commits_list.curselection()
    if not selection: return

    commit_line = commits_list.get(selection[0])
    commit_hash = commit_line.split()[0]

    diff, _ = run_git(["git", "show", "--stat", "--patch", "--max-count=1", commit_hash])
    diff = diff[:MAX_DIFF_CHARS]

    diff_text.config(state=tk.NORMAL)
    diff_text.delete("1.0", tk.END)
    
    # Coloreado simple de diff
    for line in diff.splitlines():
        if line.startswith('+'):
            diff_text.insert(tk.END, line + "\n", "added")
        elif line.startswith('-'):
            diff_text.insert(tk.END, line + "\n", "removed")
        else:
            diff_text.insert(tk.END, line + "\n")
            
    diff_text.config(state=tk.DISABLED)

def cherry_pick():
    selection = commits_list.curselection()
    if not selection:
        messagebox.showwarning("Atención", "Selecciona un commit")
        return

    commit_line = commits_list.get(selection[0])
    parts = commit_line.split(maxsplit=1)
    commit_hash = parts[0]
    commit_msg = parts[1] if len(parts) > 1 else "Sin mensaje"


    if not messagebox.askyesno("Confirmar", f"¿Aplicar commit {commit_hash}?"):
        return

    result, success = run_git(["git", "cherry-pick", "-m", "1", commit_hash])

    if not success:
        # Si falla, preguntamos si quiere abortar inmediatamente
        error_msg = f"Error/Conflicto detectado:\n\n{result}\n\n¿Deseas ejecutar 'git cherry-pick --abort' para limpiar el estado?"
        if messagebox.askretrycancel("Conflicto", error_msg):
            run_git(["git", "cherry-pick", "--abort"])
            messagebox.showinfo("Abortado", "Se ha cancelado el cherry-pick y limpiado el repositorio.")
    else:
        save_to_history(commit_hash, commit_msg)
        messagebox.showinfo("Éxito", "Cherry-pick aplicado correctamente")
        load_commits()

# ---------------- UI ----------------
root = tk.Tk()
root.title("Git Cherry-Pick Visual Tool")
root.geometry("1100x700")
root.configure(bg="#1e1e1e")

style = ttk.Style()
style.theme_use("clam") # 'clam' permite mejor personalización de colores
style.configure("TFrame", background="#1e1e1e")
style.configure("TLabel", background="#1e1e1e", foreground="#ffffff")
style.configure("Header.TLabel", font=("Segoe UI", 16, "bold"))

# Header
ttk.Label(root, text="🍒 Git Cherry-Pick Helper", style="Header.TLabel").pack(pady=15)

# Top Bar
top = ttk.Frame(root)
top.pack(pady=5, fill=tk.X, padx=20)
ttk.Label(top, text="Límite:").pack(side=tk.LEFT)
limit_var = tk.StringVar(value=str(DEFAULT_LIMIT))
ttk.Entry(top, textvariable=limit_var, width=5).pack(side=tk.LEFT, padx=5)
ttk.Button(top, text="Cargar Commits", command=load_commits).pack(side=tk.LEFT, padx=10)

# Main Paned Window
main = tk.PanedWindow(root, orient=tk.HORIZONTAL, bg="#333", sashwidth=4)
main.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)

# Listbox
left_frame = ttk.Frame(main)
main.add(left_frame, width=400)
commits_list = tk.Listbox(left_frame, bg="#252526", fg="#ffffff", font=("Consolas", 10), borderwidth=0)
commits_list.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
commits_list.bind("<<ListboxSelect>>", show_diff)

# Text Diff
right_frame = ttk.Frame(main)
main.add(right_frame)
diff_text = tk.Text(right_frame, bg="#1e1e1e", fg="#d4d4d4", font=("Consolas", 10), state=tk.DISABLED)
diff_text.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)

# Tags de colores para el diff
diff_text.tag_configure("added", foreground="#4ec9b0") # Verde
diff_text.tag_configure("removed", foreground="#f44747") # Rojo

# Action Button
btn_pick = tk.Button(
    root, text="EJECUTAR CHERRY-PICK", 
    command=cherry_pick, bg="#007acc", fg="white", 
    font=("Segoe UI", 10, "bold"), pady=10, cursor="hand2"
)
btn_pick.pack(fill=tk.X, padx=20, pady=20)

root.mainloop()