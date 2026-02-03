import time
import os
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

from ftplib import FTP

# --- CONFIGURACIÓN ---
FTP_HOST = "ftp.vivasoft.link"
FTP_USER = "u335921272.vaplicacion"
FTP_PASS = "@App123viva"
REMOTE_DIR = "/cmv1/api/services/" # Carpeta en el servidor
# Esto obtiene la ruta de la carpeta donde está guardado este archivo .py
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Configuramos la carpeta local usando esa ruta
LOCAL_DIR = BASE_DIR       # Carpeta local a vigilar

class FtpUploadHandler(FileSystemEventHandler):
    def on_modified(self, event):
        # Evitamos que se dispare con carpetas, solo archivos
        if not event.is_directory and event.src_path.endswith('.php'):
            print(f"Detectado cambio en: {event.src_path}")
            self.upload_file(event.src_path)

    def upload_file(self, local_path):
        filename = os.path.basename(local_path)
        try:
            with FTP(FTP_HOST, FTP_USER, FTP_PASS) as ftp:
                ftp.cwd(REMOTE_DIR)
                with open(local_path, 'rb') as f:
                    ftp.storbinary(f'STOR {filename}', f)
            print(f"✅ {filename} subido con éxito.")
        except Exception as e:
            print(f"❌ Error al subir {filename}: {e}")

if __name__ == "__main__":
    event_handler = FtpUploadHandler()
    observer = Observer()
    observer.schedule(event_handler, LOCAL_DIR, recursive=False)
    
    print(f"🚀 Vigilando cambios en {LOCAL_DIR}...")
    observer.start()
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()