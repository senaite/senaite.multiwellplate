import Label from './Label.jsx';
import WellWrapper from "./WellWraper.jsx";



function WellsBlock({ rowsCount, colsCount }) {
    return (
        <>
            {
                Array.from({ length: (rowsCount + 1) * (colsCount + 1) }, (_, i) => {
                    const row = Math.floor(i / (colsCount + 1));
                    const col = i % (colsCount + 1);
                    const idx = (row - 1) * colsCount + col
                    if (row === 0 && col === 0) { return <div className="label empty-cell" key={0} />; }
                    if (row === 0 || col === 0) { return <Label row={row} col={col} key={-10000 * i} />; }
                    return <WellWrapper idx={idx} key={idx} />;
                })
            }
        </>
    )
}

export default WellsBlock;
