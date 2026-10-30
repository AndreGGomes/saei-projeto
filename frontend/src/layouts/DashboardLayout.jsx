import Avatar from '../ui/Avatar';
import Alert from '../ui/Alert';
import Tabs from '../ui/Tabs';
import ThemeToggle from '../components/ThemeToggle';
import { BotaoIcone } from '../ui/Button';
import { LoadingBlock } from '../ui/Spinner';
import { IconeAtualizar, IconeSair } from '../ui/icons';

const PAPEIS = {
  ALUNO: 'Estudante',
  PROFESSOR: 'Professor',
  COORDENADOR: 'Coordenação pedagógica',
};

// Shell único dos três painéis: cabeçalho fixo com marca, usuário e ações globais;
// título da página, navegação por abas e a área de conteúdo. Antes cada dashboard
// repetia esse mesmo bloco com pequenas diferenças de cor e espaçamento.
export default function DashboardLayout({
  papel = 'ALUNO',
  titulo,
  descricao,
  usuario,
  isDarkMode,
  setTheme,
  onSair,
  onAtualizar,
  abas,
  abaAtiva,
  onChangeAba,
  carregando = false,
  mensagemCarregando = 'Carregando seus dados...',
  erro,
  children,
}) {
  const rotuloPapel = PAPEIS[papel] || 'Usuário';

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-indigo-700 focus:shadow-lg dark:focus:bg-slate-900 dark:focus:text-indigo-300"
      >
        Ir para o conteúdo
      </a>

      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 backdrop-blur dark:border-slate-800 dark:bg-slate-950/85">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-sm font-black text-white shadow-sm"
              aria-hidden="true"
            >
              S
            </span>
            <div className="min-w-0 leading-tight">
              <p className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">SAEI</p>
              <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">{rotuloPapel}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {onAtualizar && (
              <BotaoIcone rotulo="Atualizar dados" onClick={onAtualizar}>
                <IconeAtualizar className="h-4 w-4" />
              </BotaoIcone>
            )}
            <ThemeToggle isDarkMode={isDarkMode} setTheme={setTheme} />

            <div className="hidden items-center gap-2.5 border-l border-slate-200 pl-3 dark:border-slate-800 sm:flex">
              <Avatar nome={usuario?.nome || ''} tamanho="sm" />
              <div className="max-w-[13rem] leading-tight">
                <p className="truncate text-xs font-semibold text-slate-800 dark:text-slate-100">
                  {usuario?.nome || 'Usuário'}
                </p>
                <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                  {usuario?.email || rotuloPapel}
                </p>
              </div>
            </div>

            <BotaoIcone rotulo="Sair da conta" variante="perigo" onClick={onSair}>
              <IconeSair className="h-4 w-4" />
            </BotaoIcone>
          </div>
        </div>
      </header>

      <main id="conteudo" className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
              {titulo}
            </h1>
            {descricao && (
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{descricao}</p>
            )}
          </div>
        </div>

        {abas && abas.length > 0 && (
          <Tabs abas={abas} ativa={abaAtiva} onChange={onChangeAba} className="mt-5" />
        )}

        <div className="mt-6 space-y-6">
          {erro && <Alert tom="erro" titulo="Algo deu errado">{erro}</Alert>}

          {carregando ? <LoadingBlock mensagem={mensagemCarregando} /> : children}
        </div>
      </main>

      <footer className="border-t border-slate-200/80 py-4 dark:border-slate-800">
        <p className="mx-auto w-full max-w-7xl px-4 text-[11px] text-slate-400 sm:px-6 lg:px-8">
          SAEI · Sistema de Apoio à Educação Inclusiva · recursos de IA com revisão pedagógica
        </p>
      </footer>
    </div>
  );
}
