# Rubrica única do Termômetro de Acessibilidade DUA.
#
# Este é o ÚNICO lugar em que os critérios de avaliação são definidos. O prompt da IA
# (services/ia/avaliacao_strategies.py) e a validação do schema (schemas/ia_schemas.py)
# leem a mesma lista, então o modelo não consegue inventar critérios e o score não pode
# ser "solto": ele é sempre a soma de quatro notas ancoradas em evidências do texto.
#
# Cada critério tem 5 indicadores verificáveis. Cada indicador vale 0, 3 ou 5 pontos,
# o que dá no máximo 25 pontos por critério e 100 no total.

PONTOS_POR_INDICADOR = 5

CRITERIOS_DUA = (
    {
        "chave": "representacao",
        "titulo": "Princípio I do DUA — Representação (o QUÊ é apresentado)",
        "indicadores": (
            "O conteúdo essencial aparece em mais de um formato (texto acompanhado de exemplo, esquema, tabela, lista ou passo a passo).",
            "As ideias centrais são explicitadas antes do detalhe (objetivo da aula/atividade e conceito-chave visíveis no texto).",
            "O vocabulário abstrato ou técnico é ancorado em exemplo concreto, analogia ou definição acessível.",
            "O texto é navegável: seções, títulos, numeração ou sumário permitem localizar a informação sem ler tudo.",
            "Há alternativa textual para conteúdo não textual (descrição/legenda de imagens, transcrição) ou instrução explícita de leitura em voz alta/escuta.",
        ),
    },
    {
        "chave": "acao_e_expressao",
        "titulo": "Princípio II do DUA — Ação e Expressão (o COMO o estudante demonstra)",
        "indicadores": (
            "Existe mais de uma forma de o estudante demonstrar o que aprendeu (oral, escrita, desenho, projeto, gravação).",
            "Os comandos das atividades são decompostos em passos curtos e numerados.",
            "Há previsão de tempo flexível e/ou de apoio (professor de apoio, AEE, consulta a material de referência).",
            "Os critérios de avaliação da tarefa estão explícitos no texto (o que será observado).",
            "Há alternativa de registro para quem não produz o formato padrão (ditado, áudio, prova oral, registro por desenho).",
        ),
    },
    {
        "chave": "engajamento",
        "titulo": "Princípio III do DUA — Engajamento (o PORQUÊ de aprender)",
        "indicadores": (
            "O conteúdo é conectado à realidade, ao cotidiano ou ao interesse do estudante.",
            "Há espaço de escolha/autonomia (tema, formato de entrega, ordem das tarefas).",
            "Há previsão de interação, colaboração entre pares ou mediação pedagógica.",
            "Há previsão de feedback, autoavaliação ou acompanhamento do progresso.",
            "Há controle de sobrecarga: atividades fracionadas, pausas ou extensão compatível com o tempo de aula.",
        ),
    },
    {
        "chave": "acessibilidade_do_formato",
        "titulo": "Formato, clareza e diretrizes institucionais (SAEI)",
        "indicadores": (
            "A linguagem é direta: frases curtas, voz ativa e termos técnicos explicados na primeira ocorrência.",
            "A estrutura usa listas, quadros ou tabelas em vez de blocos densos de texto corrido.",
            "Os critérios de avaliação são diagnósticos e formativos, com o progresso individual prevalecendo sobre o quantitativo.",
            "Quando pertinente ao público-alvo, o texto cita recursos de acessibilidade ou Tecnologia Assistiva (fonte ampliada, alto contraste, Braille, Libras, audiodescrição, leitor de tela).",
            "O material preserva os mesmos objetos de conhecimento/BNCC, sem propor um currículo paralelo.",
        ),
    },
)

# Chaves que obrigatoriamente devem voltar na resposta da IA, na ordem acima.
CHAVES_CRITERIOS = tuple(criterio["chave"] for criterio in CRITERIOS_DUA)

# Pontuação máxima de cada critério e do termômetro inteiro.
PONTOS_POR_CRITERIO = len(CRITERIOS_DUA[0]["indicadores"]) * PONTOS_POR_INDICADOR
PONTUACAO_MAXIMA = PONTOS_POR_CRITERIO * len(CRITERIOS_DUA)


# Traduz a nota final em um rótulo único. Usado no prompt e no schema, para que a
# legenda devolvida pela API nunca divirja do número exibido no termômetro.
def nivel_por_pontuacao(score: int) -> str:
    if score >= 75:
        return "Alta acessibilidade (DUA)"
    if score >= 50:
        return "Acessibilidade média"
    if score >= 25:
        return "Baixa acessibilidade"
    return "Acessibilidade muito baixa"
