import { cleanAndJoinClasses } from '../utils/helpers.js';


function Well({ idx, children, ref, onWellClick, isDragging, isSelected,
  assignedAnalyses, prepositionedItems, prepositionMode, fieldConfig, isAssignable }) {

  const prepositioned = prepositionedItems || {};
  const wellClasses = ['well', 'element',
    isSelected ? 'well--selected' : '',
    assignedAnalyses.length > 0 ? 'well--has-analyses' : 'well--empty',
    (isAssignable === false) ? 'well--not-assignable': '',
    Object.keys(prepositioned).length && isDragging ? 'well--is-prepositioned' : '',
  ]

  const showOverlay = isDragging && Object.keys(prepositioned).length > 0;
  const overlayItemsStyle = {
    '--position-anchor': `--well-${idx}`,
    top: `anchor(${prepositionMode === 'row' ? 'bottom' : 'top'})`,
    left: `anchor(${prepositionMode === 'row' ? 'left' : 'right'})`,
    flexDirection: prepositionMode === 'row' ? 'column' : 'row',
  };

  return (
    <>
      <div
        className={cleanAndJoinClasses(wellClasses)}
        ref={ref}
        onClick={onWellClick}
        style={{ anchorName: `--well-${idx}` }}
      >
        {assignedAnalyses.length > 1 && <div className='well-analyses-counter-subscript'>{assignedAnalyses.length}</div>}
        <div className='well-inner'>
          {assignedAnalyses.length == 0 ? (
            <div className="well-center-header">
              <h2 >
                {idx}
              </h2>
            </div>
          ) : (
            <>
              <div className="well-sticky-header">
                <h2>{idx}</h2>
              </div>
              <div className='well-analyses-list-container'>
                {children}
              </div>
            </>
          )}
        </div>
      </div>
      {(showOverlay) && (
        <div className="drag-overlay-item-on-well" style={overlayItemsStyle}>
          <div className="drag-overlay-item">
            {Object.entries(prepositioned).map(([key, value]) => {
              return (
                <div key={key} className="item-content">
                  <div className="item-name">
                    {Object.entries(value).map(([fieldKey, fieldValue]) => {
                      if (!['both', 'title'].includes(fieldConfig[fieldKey]?.display_mode)) return null;
                      return <span key={fieldKey} className={`name-${fieldKey}`}>{fieldValue}&nbsp;</span>
                    })}
                  </div>
                  <div className="item-meta">
                    {Object.entries(value).map(([fieldKey, fieldValue]) => {
                      if (!['both', 'description'].includes(fieldConfig[fieldKey]?.display_mode)) return null;
                      return <span key={fieldKey} className={`meta-${fieldKey}`}>{fieldValue}&nbsp;</span>
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </>
  );
}

export default Well;