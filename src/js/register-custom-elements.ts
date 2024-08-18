import { HTMLGameLocation } from "./custom-elements/HTMLGameLocation";
import { HTMLGameLogic } from "./custom-elements/HTMLGameLogic";
import { HTMLGameDataProperty } from "./custom-elements/HTMLGameDataProperty";
import { HTMLGameData } from "./custom-elements/HTMLGameData";
import { HTMLGameDataAction } from "./custom-elements/HTMLGameDataAction";
import { HTMLGameLogicAction } from "./custom-elements/HTMLGameLogicAction";
import { HTMLGameLogicOption } from "./custom-elements/HTMLGameLogicOption";
import { HTMLGameLogicCondition } from "./custom-elements/HTMLGameLogicCondition";
import {HTMLGameInteractable} from "./custom-elements/HTMLGameInteractable";

window.customElements.define('game-interactable', HTMLGameInteractable);
window.customElements.define('game-location', HTMLGameLocation);
//
window.customElements.define('game-data', HTMLGameData);
window.customElements.define('game-data-action', HTMLGameDataAction);
window.customElements.define('game-data-property', HTMLGameDataProperty);
//
window.customElements.define('game-logic', HTMLGameLogic);
window.customElements.define('game-logic-action', HTMLGameLogicAction);
window.customElements.define('game-logic-option',HTMLGameLogicOption);
window.customElements.define('game-logic-condition', HTMLGameLogicCondition);
//
