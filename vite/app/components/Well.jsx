import { cleanAndJoinClasses } from '../utils/helpers.js';


function Well({ idx,
  ref, attributes, listeners,
  onWellClick, isDragging, isSelected,
  hasAnalyses, isDroppable, isPrepositioned }) {


  const wellClasses = ['well', 'element',
    isSelected ? 'well--selected' : '',
    hasAnalyses ? 'well--has-analyses' : 'well--empty',
    !isDroppable && isDragging ? 'well--not-droppable-dragging' : '',
    isPrepositioned && isDragging ? 'well--is-prepositioned' : '',
  ]

  return (
    <div className={cleanAndJoinClasses(wellClasses)} onClick={onWellClick} {...listeners} {...attributes} ref={ref}>
      <div className='well-inner'>
        {idx}
      </div>
    </div>
  );
}

export default Well;