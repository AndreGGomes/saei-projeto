# Utilitário de extração de texto em arquivos PDF.
# Responsabilidade única: abrir o arquivo físico salvo em disco, varrer suas páginas
# e consolidar todo o conteúdo textual legível para consumo dos serviços de IA.

import PyPDF2

class PDFExtractor:
    @staticmethod
    def extrair_texto(caminho_arquivo: str) -> str:
        """Lê o arquivo PDF do disco e devolve o texto bruto concatenado."""
        texto_extraido = ""
        try:
            # Abre o arquivo em modo binário de leitura (rb) para manipulação pelo PyPDF2
            with open(caminho_arquivo, 'rb') as arquivo:
                leitor = PyPDF2.PdfReader(arquivo)

                # Percorre cada página do documento extraindo o conteúdo de texto disponível
                for pagina in leitor.pages:
                    texto = pagina.extract_text()
                    if texto:
                        texto_extraido += texto + "\n"

            # Remove quebras de linha e espaços sobrando nas pontas
            return texto_extraido.strip()

        except Exception as e:
            # Se o arquivo estiver corrompido ou o caminho for inválido, lança erro legível
            raise ValueError(f"Falha ao ler o arquivo PDF: {str(e)}")