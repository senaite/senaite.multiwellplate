function PanelHeader({ title, count }) {

    return (
        <div className="list-panel-header">
            <h3 className="list-title">{title}</h3>
            <span className="list__total">{count}</span>
        </div>
    );

}

export default PanelHeader;


