import { Modifier } from '@dnd-kit/abstract';


export class SnapCenterToCursor extends Modifier {

    apply({ activatorEvent, shape, transform }) {

        if (!shape) return transform;

        const activatorCoordinates = {
            x: activatorEvent.clientX,
            y: activatorEvent.clientY
        };

        const draggingNodeRect = shape.initial;

        const offsetX = activatorCoordinates.x - draggingNodeRect.left;
        const offsetY = activatorCoordinates.y - draggingNodeRect.top;
        
        return {
            ...transform,
            x: transform.x + offsetX - draggingNodeRect.width / 2,
            y: transform.y + offsetY - draggingNodeRect.height / 2,
        };
    }
};
