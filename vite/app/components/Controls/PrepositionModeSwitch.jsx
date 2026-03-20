import { useContext, useSyncExternalStore } from 'react';
import { WorksheetPresenterContext } from '../../App.jsx';

const PrepositionModeSwitch = () => {
  const presenter = useContext(WorksheetPresenterContext);
  const prepositionMode = useSyncExternalStore(
    presenter.subscribe,
    () => presenter.getPrepositionMode()
  );

  return (
    <div className="preposition-mode-switch">
      <button
        className={`switch-btn ${prepositionMode === 'row' ? 'active' : ''}`}
        onClick={() => presenter.setPrepositionMode('row')}
        aria-label="Rows preposition layout"
        title='Rows preposition layout'
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="8" y1="6" x2="21" y2="6" />
          <line x1="8" y1="12" x2="21" y2="12" />
          <line x1="8" y1="18" x2="21" y2="18" />
          <line x1="3" y1="6" x2="3.01" y2="6" />
          <line x1="3" y1="12" x2="3.01" y2="12" />
          <line x1="3" y1="18" x2="3.01" y2="18" />
        </svg>
      </button>
      <button
        className={`switch-btn ${prepositionMode === 'col' ? 'active' : ''}`}
        onClick={() => presenter.setPrepositionMode('col')}
        aria-label="Columns preposition layout"
        title='Columns preposition layout'
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      </button>
    </div>
  );
};

export default PrepositionModeSwitch;