
function Label({ row, col }) {
    return (
        <div className={`label ${(row == 0) ? `col-label` : `row-label`}`}>
            {(col == 0) ? String.fromCharCode(65 + row - 1) : col}
        </div>
    );
}

export default Label;