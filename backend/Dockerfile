# Usa uma imagem leve do Python
FROM python:3.11-slim

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia apenas o requirements.txt primeiro (otimização de cache do Docker)
COPY requirements.txt .

# Instala as dependências
RUN pip install --no-cache-dir -r requirements.txt

# Copia o resto do código da aplicação
COPY . .

# O comando padrão será executado pelo entrypoint.sh
CMD ["bash", "entrypoint.sh"]