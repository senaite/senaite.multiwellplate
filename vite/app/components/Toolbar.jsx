
import PrepositionModeSwitch from "./Controls/PrepositionModeSwitch.jsx";


function PlateTools({ref}) {

    return (
        <div className="toolbar plate__toolbar" ref={ref}>
            <PrepositionModeSwitch />
        </div>
    );

}

export { PlateTools };