export default function PageHeader({ titulo, descricao, acao }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
          {titulo}
        </h2>
        {descricao && (
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{descricao}</p>
        )}
      </div>
      {acao && <div className="flex flex-wrap items-center gap-2">{acao}</div>}
    </div>
  );
}
