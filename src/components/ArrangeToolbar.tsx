interface Props {
  onCancel: () => void;
  onSave: () => void;
  onReset?: () => void;
  dirty: boolean;
}

export function ArrangeToolbar({ onCancel, onSave, onReset, dirty }: Props) {
  return (
    <div className="arrange-bar" role="region" aria-label="Röðun mynda">
      <p className="arrange-bar__text">
        <strong>Röðun.</strong> Dragðu og slepptu myndum til að breyta röðinni.
        <span className="arrange-bar__alt"> Einnig má nota ··· valmyndina eða lyklaborð.</span>
      </p>
      <div className="arrange-bar__actions">
        {onReset && (
          <button type="button" className="btn btn--text" onClick={onReset}>
            Endurstilla
          </button>
        )}
        <button type="button" className="btn btn--secondary" onClick={onCancel}>
          Hætta við
        </button>
        <button type="button" className="btn btn--primary" onClick={onSave} disabled={!dirty}>
          Vista röð
        </button>
      </div>
    </div>
  );
}
