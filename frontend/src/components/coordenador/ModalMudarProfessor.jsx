import Button from '../../ui/Button';
import Modal from '../../ui/Modal';
import { Field, Select } from '../../ui/Field';
import { IconeUsuarios } from '../../ui/icons';

const FORM_ID = 'form-mudar-professor';

// Troca do professor responsável por uma matrícula.
export default function ModalMudarProfessor({
  matricula,
  professores,
  novoEmail,
  setNovoEmail,
  onSubmit,
  onCancelar,
}) {
  return (
    <Modal
      onFechar={onCancelar}
      titulo="Alterar professor responsável"
      descricao={`${matricula.aluno.nome} · ${matricula.disciplina.codigo} — ${matricula.disciplina.nome}`}
      icone={<IconeUsuarios className="h-5 w-5" />}
      largura="sm"
      rodape={
        <>
          <Button variante="fantasma" onClick={onCancelar}>
            Cancelar
          </Button>
          <Button type="submit" form={FORM_ID}>
            Confirmar troca
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={onSubmit} className="space-y-4">
        <Field label="Novo professor" obrigatorio>
          {(props) => (
            <Select
              {...props}
              value={novoEmail}
              onChange={(e) => setNovoEmail(e.target.value)}
              required
            >
              <option value="">Selecione o professor</option>
              {professores.map((p, idx) => (
                <option key={p.email || idx} value={p.email}>
                  {p.nome} ({p.email})
                </option>
              ))}
            </Select>
          )}
        </Field>

        <p className="rounded-xl bg-slate-50 px-3.5 py-3 text-xs leading-relaxed text-slate-500 dark:bg-slate-950/60 dark:text-slate-400">
          O professor atual perde o acesso aos documentos desta matrícula; o novo passa a ver e
          enviar materiais.
        </p>
      </form>
    </Modal>
  );
}
