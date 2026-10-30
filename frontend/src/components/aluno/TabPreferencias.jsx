import Badge from '../../ui/Badge';
import Button from '../../ui/Button';
import { Card, CardBody, CardHeader } from '../../ui/Card';
import { Field, Textarea } from '../../ui/Field';
import { IconeBrilhos, IconeCheck } from '../../ui/icons';

// Preferências de aprendizagem: um cartão por matrícula, salvando via PATCH
// /matriculas/{id}/preferencias. O texto é visível para o professor da disciplina.
export default function TabPreferencias({
  matriculas,
  preferencias,
  onEditar,
  onSalvar,
  salvandoId,
  salvoId,
}) {
  return (
    <div className="space-y-6">
      <Card className="border-indigo-200/70 bg-indigo-50/50 dark:border-indigo-900/60 dark:bg-indigo-950/20">
        <CardBody className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm dark:bg-slate-900 dark:text-indigo-300">
            <IconeBrilhos className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-semibold text-indigo-900 dark:text-indigo-200">
              Como você aprende melhor?
            </p>
            <p className="mt-0.5 text-xs leading-relaxed text-indigo-800/80 dark:text-indigo-300/80">
              Conte o que ajuda na sua participação: exemplos visuais, mais tempo para leitura,
              instruções passo a passo, trabalho em dupla. O professor e a coordenação usam isso para
              adaptar as aulas.
            </p>
          </div>
        </CardBody>
      </Card>

      <div className="space-y-4">
        {matriculas.map((m) => {
          const valor = preferencias[m.id] ?? '';
          const valorSalvo = m.preferencias_do_aluno || '';
          const alterado = valor !== valorSalvo;
          const salvando = salvandoId === m.id;
          const salvo = salvoId === m.id && !alterado;

          return (
            <Card key={m.id}>
              <CardHeader
                titulo={m.disciplina.nome}
                descricao={`Professor(a): ${m.professor.nome}`}
                icone={<IconeBrilhos className="h-4 w-4" />}
                acao={
                  <div className="flex items-center gap-2">
                    <Badge tom="indigo" mono>
                      {m.disciplina.codigo}
                    </Badge>
                    {salvo && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        <IconeCheck className="h-3.5 w-3.5" />
                        Salvo
                      </span>
                    )}
                  </div>
                }
              />
              <CardBody>
                <Field
                  label="Minhas preferências nesta disciplina"
                  dica={
                    valor.trim() === ''
                      ? 'Sem preferência definida para esta disciplina.'
                      : `${valor.length} caractere(s) · visível para o professor desta disciplina.`
                  }
                >
                  {(props) => (
                    <Textarea
                      {...props}
                      value={valor}
                      onChange={(e) => onEditar(m.id, e.target.value)}
                      rows={4}
                      placeholder="Ex.: Prefiro instruções visuais, exemplos práticos e um pouco mais de tempo para leitura..."
                      className={`${props.className} resize-y`}
                    />
                  )}
                </Field>
              </CardBody>
              <div className="flex justify-end border-t border-slate-200/70 px-5 py-3.5 dark:border-slate-800">
                <Button
                  tamanho="sm"
                  carregando={salvando}
                  disabled={!alterado}
                  onClick={() => onSalvar(m.id)}
                >
                  {salvando ? 'Salvando...' : 'Salvar preferência'}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
