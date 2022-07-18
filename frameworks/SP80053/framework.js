const _ = require("lodash");
require("deepdash")(_);

// frameworkData supplied needs to be processed. This function:
// brings in missing data from other data source (baselines)
// standardizes controlId case (upper)
// adds parent detail to control/enhancement
const initFrameworkData = async (data) => {
  const bl = require("./baselines");
  const util = require("util");
  const getBaselinesPromisified = util.promisify(bl.getBaselines);
  const allBaselines = await getBaselinesPromisified();

  // update family id `ac` to `AC`
  data = data.map((family) => {
    family.id = _.toUpper(family.id);
    return family;
  });

  return _.eachDeep(
    data,
    (child, i, parent, ctx) => {
      if (
        (child.id && child.class === "SP800-53") ||
        child.class === "SP800-53-enhancement"
      ) {
        // force upper case
        child.id = _.toUpper(child.id);

        // check if control is withdrawn
        child.withdrawn = false;
        const props = _.get(child, "props");
        if (props)
          if (_.find(props, { name: "status", value: "withdrawn" }))
            child.withdrawn = true;

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
      }
    },
    {
      childrenPath: "controls",
    }
  );
};

exports.makeFramework = (data) => {
  const makeControl = require("./control").makeControl;

  let frameworkData = data;

  const getFamilies = async (callback) => {
    const d = await initFrameworkData(frameworkData);
    const families = _.filter(d, { class: "family" });
    return callback(null, families);
  };

  const getFamiliesById = (controlId, callback) => {
    controlId = _.toUpper(controlId);

    getFamilies((err, families) => {
      const family = _.find(families, (el) => el.id === controlId);
      return callback(null, family);
    });
  };

  const getControls = async (callback, enhancements = true) => {
    const d = await initFrameworkData(frameworkData);
    let controls = [];

    _.eachDeep(
      d,
      (child, i, parent, ctx) => {
        if (
          (child.id && child.class === "SP800-53") ||
          (enhancements && child.class === "SP800-53-enhancement")
        ) {
          controls.push(makeControl(child));
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
