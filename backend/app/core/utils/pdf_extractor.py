# app/core/utils/pdf_extractor.py
import PyPDF2

class PDFExtractor:
    @staticmethod
    def extrair_texto(caminho_arquivo: str) -> str:
        """Responsabilidade única: ler um arquivo do disco e extrair o texto."""
        texto_extraido = ""
        try:
            with open(caminho_arquivo, 'rb') as arquivo:
                leitor = PyPDF2.PdfReader(arquivo)
                for pagina in leitor.pages:
                    texto = pagina.extract_text()
                    if texto:
                        texto_extraido += texto + "\n"
            return texto_extraido.strip()
        except Exception as e:
            raise ValueError(f"Falha ao ler o arquivo PDF: {str(e)}")