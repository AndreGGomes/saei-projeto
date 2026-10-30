import Badge from '../../ui/Badge';
import Button from '../../ui/Button';
import { Card, CardBody, CardHeader } from '../../ui/Card';
import EmptyState from '../../ui/EmptyState';
import StatCard from '../../ui/StatCard';
import { IconeBrilhos, IconeDocumento, IconeLivro, IconeUsuarios } from '../../ui/icons';

// Visão geral do aluno: indicadores + lista de disciplinas com atalho para os anexos.
export default function TabVisaoGeral({ matriculas, onVerDocumentos }) {
  const disciplinasUnicas = Array.from(new Set(matriculas.map((m) => m.disciplina.codigo)));
  const comPreferencia = matriculas.filter((m) => (m.preferencias_do_aluno || '').trim() !== '');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          rotulo="Matrículas"
          valor={matriculas.length}
          detalhe="Disciplinas em que você está matriculado"
          tom="indigo"
          icone={<IconeUsuarios className="h-5 w-5" />}
        />
        <StatCard
          rotulo="Disciplinas"
          valor={disciplinasUnicas.length}
          detalhe="Códigos distintos"
          tom="esmeralda"
          icone={<IconeLivro className="h-5 w-5" />}
        />
        <StatCard
          rotulo="Preferências definidas"
          valor={`${comPreferencia.length}/${matriculas.length}`}
          detalhe="Ajudam o professor a adaptar as aulas"
          tom="violeta"
          icone={<IconeBrilhos className="h-5 w-5" />}
        />
      </div>

      <Card>
        <CardHeader
          titulo="Minhas disciplinas"
          descricao="Cada disciplina tem um professor responsável pelos materiais."
          icone={<IconeLivro className="h-4 w-4" />}
        />

        {matriculas.length === 0 ? (
          <CardBody>
            <EmptyState
              titulo="Nenhuma disciplina por aqui"
              descricao="Assim que a coordenação registrar sua matrícula, ela aparece nesta lista."
            />
          </CardBody>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {matriculas.map((m) => {
              const temPreferencia = (m.preferencias_do_aluno || '').trim() !== '';
              return (
                <li
                  key={m.id}
                  className="flex flex-wrap items-center justify-between gap-4 px-5 py-4"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tom="indigo" mono>
                        {m.disciplina.codigo}
                      </Badge>
                      <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                        {m.disciplina.nome}
                      </p>
                    </div>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {m.professor.nome} · {m.professor.email}
                    </p>
                    <div className="mt-1.5">
                      <Badge tom={temPreferencia ? 'esmeralda' : 'neutro'}>
                        {temPreferencia ? 'Preferências definidas' : 'Preferências pendentes'}
                      </Badge>
                    </div>
                  </div>

                  <Button
                    variante="secundario"
                    tamanho="sm"
                    onClick={() => onVerDocumentos(m)}
                    iconeEsquerda={<IconeDocumento className="h-4 w-4" />}
                  >
                    Ver documentos
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
