#!/usr/bin/env python3
"""Abre o dashboard por HTTP local para que o navegador consiga ler dados.json."""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import threading
import webbrowser

PASTA = Path(__file__).resolve().parent
HOST = "127.0.0.1"
PORTA = 8000

class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(PASTA), **kwargs)

if __name__ == "__main__":
    servidor = ThreadingHTTPServer((HOST, PORTA), Handler)
    url = f"http://{HOST}:{PORTA}/index.html"
    print("Dashboard local iniciado.")
    print(f"Endereco: {url}")
    print("Mantenha esta janela aberta enquanto usa o dashboard.")
    print("Para encerrar, pressione Ctrl+C nesta janela.")
    threading.Timer(1.0, lambda: webbrowser.open(url)).start()
    try:
        servidor.serve_forever()
    except KeyboardInterrupt:
        print("\nServidor encerrado.")
    finally:
        servidor.server_close()
