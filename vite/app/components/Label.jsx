
function Label({ row, col }) {
    return (
        <div className={`label ${(row == 0) ? `col-label` : `row-label`}`}>
            {(row == 0) ? String.fromCharCode(65 + col - 1) : row}
        </div>
    );
}

export default Label;