# Responsabilidade única: gravar e remover arquivos físicos na pasta de uploads.
import os
import shutil
import uuid
from pathlib import Path

from fastapi import UploadFile

# Diretório base onde os arquivos reais serão armazenados
UPLOAD_DIR = Path("uploads")


class ArquivoStorage:
    def __init__(self, upload_dir: Path = UPLOAD_DIR):
        self.upload_dir = upload_dir
        # Garante que a pasta física de uploads exista no servidor
        self.upload_dir.mkdir(parents=True, exist_ok=True)

    def salvar_upload(self, arquivo: UploadFile) -> str:
        """Grava o upload no disco em blocos e devolve o caminho físico final."""
        # Gera um nome de arquivo único para não haver colisão em disco
        extensao = Path(arquivo.filename).suffix if arquivo.filename else ""
        nome_seguro = f"{uuid.uuid4().hex}{extensao}"
        caminho_destino = self.upload_dir / nome_seguro

        try:
            with open(caminho_destino, "wb") as buffer:
                # Mesmo que o usuário faça upload de um PDF pesado ou de uma imagem de alta resolução,
                # o servidor não aloca o arquivo inteiro na memória RAM de uma vez.
                shutil.copyfileobj(arquivo.file, buffer)
        finally:
            arquivo.file.close()

        return str(caminho_destino)

    def remover(self, caminho: str) -> None:
        """Remove o arquivo físico se ele existir no disco, sem propagar erro de OS."""
        if os.path.exists(caminho):
            try:
                os.remove(caminho)
            except OSError:
                pass
