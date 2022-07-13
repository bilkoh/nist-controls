exports.makeFramework = (data) => {
  const _ = require("lodash");
  require("deepdash")(_);
  const makeControl = require("./control").makeControl;

  let frameworkData = data;

  const getFamilies = (callback) => {
    const families = _.filter(frameworkData, { class: "family" });
    return callback(null, families);
  };

  const getFamiliesById = (controlId, callback) => {
    // force lowercase
    controlId = controlId.toLowerCase();

    getFamilies((err, families) => {
      const family = _.find(families, (el) => el.id === controlId);
      return callback(null, family);
    });
  };

  const getControls = async (callback, enhancements = true) => {
    const bl = require("./baselines");

    const util = require("util");
    const getBaselinesPromisified = util.promisify(bl.getBaselines);
    const allBaselines = await getBaselinesPromisified();

    let controls = [];

    _.eachDeep(
      frameworkData,
      (child, i, parent, ctx) => {
        if (
          (child.id && child.class === "SP800-53") ||
          (enhancements && child.class === "SP800-53-enhancement")
        ) {
          // force upper case
          child.id = child.id.toUpperCase();

          // pass needed  info from parent
          child.parentId = parent.id;
          child.parentTitle = parent.title;

          // since id from json source uses dot notation for enhancement
          // and the baselines come from xml with use parentheses,
          // I've got to convert for baseline lookups
          let idForBaselines = child.id;
          if (child.id.indexOf(".") !== -1) {
            const [ctl, enh] = child.id.split(".");
            idForBaselines = `${ctl}(${enh})`;
          }

          child.baselines = allBaselines[idForBaselines.toUpperCase()] || [];
          controls.push(makeControl(child));
          // controls.push(child);
        }
      },
      {
        childrenPath: "controls",
      }
    );

    return callback(null, controls);
  };

  const getControlById = (controlId, callback, enhancements = true) => {
    // force uppercase
    controlId = controlId.toUpperCase();

    // json source uses different notation (period instead of parenthesis)
    // we should be able to use both when looking up enhancements
    if (enhancements && controlId.indexOf("(") > -1) {
      let [id, enhancement] = controlId.split("(");
      enhancement = enhancement.substring(0, enhancement.length - 1);
      controlId = id + "." + enhancement;
    }

    getControls((err, controls) => {
      if (err) {
        return callback(err);
      } else {
        const control = _.find(controls, (el) => el.id === controlId);

        if (!control) {
          return callback(new Error(`Control ${controlId} was not found.`));
        }

        return callback(null, control);
      }
    }, enhancements);
  };

  return {
    frameworkData: frameworkData,
    getControls: getControls,
    getControlById: getControlById,
    getFamilies: getFamilies,
    getFamiliesById: getFamiliesById,
  };
};
