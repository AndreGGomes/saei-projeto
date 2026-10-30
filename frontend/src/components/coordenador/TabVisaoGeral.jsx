import { Card, CardBody, CardHeader } from '../../ui/Card';
import StatCard from '../../ui/StatCard';
import { IconeDocumento, IconeLivro, IconeTutoria, IconeUsuarios } from '../../ui/icons';

// Indicadores gerais da coordenação.
export default function TabVisaoGeral({ tutorados, disciplinas, professores, matriculas }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          rotulo="Alunos tutorados"
          valor={tutorados.length}
          detalhe="Sob seu acompanhamento direto"
          tom="violeta"
          icone={<IconeTutoria className="h-5 w-5" />}
        />
        <StatCard
          rotulo="Disciplinas"
          valor={disciplinas.length}
          detalhe="Cadastradas na instituição"
          tom="indigo"
          icone={<IconeLivro className="h-5 w-5" />}
        />
        <StatCard
          rotulo="Professores"
          valor={professores.length}
          detalhe="Corpo docente registrado"
          tom="ceu"
          icone={<IconeUsuarios className="h-5 w-5" />}
        />
        <StatCard
          rotulo="Matrículas ativas"
          valor={matriculas.length}
          detalhe="Vínculos aluno × disciplina"
          tom="esmeralda"
          icone={<IconeDocumento className="h-5 w-5" />}
        />
      </div>

      <Card>
        <CardHeader
          titulo="Fluxo de trabalho"
          descricao="O caminho recomendado para manter a base organizada."
        />
        <CardBody>
          <ol className="grid grid-cols-1 gap-3 text-sm md:grid-cols-3">
            <li className="rounded-xl border border-slate-200/80 p-4 dark:border-slate-800">
              <p className="text-xs font-bold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
                1. Disciplinas
              </p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                Cadastre nome e código único antes de criar qualquer vínculo.
              </p>
            </li>
            <li className="rounded-xl border border-slate-200/80 p-4 dark:border-slate-800">
              <p className="text-xs font-bold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
                2. Matrículas
              </p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                Vincule aluno, professor e disciplina. É isso que libera o envio de documentos.
              </p>
            </li>
            <li className="rounded-xl border border-slate-200/80 p-4 dark:border-slate-800">
              <p className="text-xs font-bold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
                3. Tutoria
              </p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                Assuma a tutoria dos estudantes que precisam de acompanhamento individual.
              </p>
            </li>
          </ol>
        </CardBody>
      </Card>
    </div>
  );
}
