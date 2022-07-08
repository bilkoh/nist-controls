// import makeFramework from "./frameworks/SP80053/framework.js";
// import { sp80053ControlsJSON } from "./frameworks/SP80053/source-loader.js";

const makeFramework = require("./frameworks/SP80053/framework").makeFramework;
const sp80053ControlsJSON =
  require("./frameworks/SP80053/source-loader").sp80053ControlsJSON;
// console.log(makeFramework);
exports.SP80053 = () => {
  return makeFramework(sp80053ControlsJSON());
};
