const makeFramework = require("./frameworks/SP80053/framework").makeFramework;
const sp80053ControlsJSON =
  require("./frameworks/SP80053/source-loader").sp80053ControlsJSON;
exports.SP80053 = () => {
  return makeFramework(sp80053ControlsJSON());
};
