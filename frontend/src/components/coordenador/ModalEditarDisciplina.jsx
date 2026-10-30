import Button from '../../ui/Button';
import Modal from '../../ui/Modal';
import { Field, Input } from '../../ui/Field';
import { IconeLivro } from '../../ui/icons';

const FORM_ID = 'form-renomear-disciplina';

// Renomear disciplina: usa o modal base (Escape, foco e rodapé padronizados).
export default function ModalEditarDisciplina({
  disciplina,
  novoNome,
  setNovoNome,
  onSubmit,
  onCancelar,
}) {
  return (
    <Modal
      onFechar={onCancelar}
      titulo="Renomear disciplina"
      descricao={`Código ${disciplina.codigo} — o código não muda.`}
      icone={<IconeLivro className="h-5 w-5" />}
      largura="sm"
      rodape={
        <>
          <Button variante="fantasma" onClick={onCancelar}>
            Cancelar
          </Button>
          <Button type="submit" form={FORM_ID}>
            Salvar
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={onSubmit} className="space-y-4">
        <Field label="Novo nome" obrigatorio>
          {(props) => (
            <Input
              {...props}
              type="text"
              value={novoNome}
              onChange={(e) => setNovoNome(e.target.value)}
              required
              autoFocus
            />
          )}
        </Field>
      </form>
    </Modal>
  );
}
