import { WIDGET_LAYOUT_MODE, HIDDEN_LAYOUT_MODE, CONTAINER_LAYOUT_MODE } from "../config.js";

const isWidget = (mode) => mode === WIDGET_LAYOUT_MODE;
const isOpen = (mode) => mode !== HIDDEN_LAYOUT_MODE;
const isContainered =(mode) => mode === CONTAINER_LAYOUT_MODE;

const cleanAndJoinClasses = (classesArray) => {
  return classesArray.join(' ').replaceAll(/\s+/gi, " ").trim();
}



export {
  isWidget, isOpen, isContainered,
  cleanAndJoinClasses
}
