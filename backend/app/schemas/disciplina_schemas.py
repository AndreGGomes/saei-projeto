# Define o formato para criar matérias letivas e como elas são devolvidas para a listagem.

from pydantic import BaseModel

# formulário de criação de disciplina. Quem cadastra precisa enviar apenas o nome e o código. O ID não é enviado aqui porque é o banco que gera.
class DisciplinaCreate(BaseModel):
    nome: str
    codigo: str

# Resposta com dados da disciplina. Ao devolver a matéria para a tela, adiciona o id gerado pelo PostgreSQL.
class DisciplinaResponse(BaseModel):
    id: int
    nome: str
    codigo: str
    class Config:
        from_attributes = True