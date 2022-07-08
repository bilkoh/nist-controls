const _ = require("lodash");
const sourceLoader = require("./source-loader");

// XML source doesn't provide baselines for enhancements
const getBaselinesFromXML = (controlId, callback) => {
  sourceLoader.sp80053ControlsXML((err, controls) => {
    if (err) return callback(err);
    const control = _.find(controls, { number: [controlId.toUpperCase()] });
    callback(control?.baseline);
  });
};

const getBaselinesLowFromCSV = (callback) => {
  sourceLoader.sp80053BaselinesLow((err, controls) => {
    if (err) return callback(err);
    controls.shift(); // remove first row (headers)
    callback(
      err,
      controls.map((el) => el[0])
    );
  });
};
const getBaselinesModerateFromCSV = (callback) => {
  sourceLoader.sp80053BaselinesModerate((err, controls) => {
    if (err) return callback(err);
    controls.shift(); // remove first row (headers)
    callback(
      err,
      controls.map((el) => el[0])
    );
  });
};
const getBaselinesHighFromCSV = (callback) => {
  sourceLoader.sp80053BaselinesHigh((err, controls) => {
    if (err) return callback(err);
    controls.shift(); // remove first row (headers)
    callback(
      err,
      controls.map((el) => el[0])
    );
  });
};
const getBaselinesPrivacyFromCSV = (callback) => {
  sourceLoader.sp80053BaselinesPrivacy((err, controls) => {
    if (err) return callback(err);
    controls.shift(); // remove first row (headers)
    callback(
      err,
      controls.map((el) => el[0])
    );
  });
};

const getBaselines = (callback) => {
  const util = require("util");

  const calls = [
    util.promisify(getBaselinesLowFromCSV)(),
    util.promisify(getBaselinesModerateFromCSV)(),
    util.promisify(getBaselinesHighFromCSV)(),
    util.promisify(getBaselinesPrivacyFromCSV)(),
  ];

  Promise.all(calls)
    .then((el) => {
      const indexToKeysScheme = {
        0: "LOW",
        1: "MODERATE",
        2: "HIGH",
        3: "PRIVACY",
      };
      const baselines = {};

      el.forEach((e, i) => {
        const baselineKey = indexToKeysScheme[i];
        e.forEach((ee) => {
          let val = _.has(baselines, ee) ? baselines[ee] : [];
          val = _.union(val, [baselineKey]);
          baselines[ee] = val;
        });
      });
      callback(null, baselines);
    })
    .catch((err) => callback(err));
};

// this should not be used while iterating through controls
// way too resource intensive
const getBaselinesById = (controlId, callback) => {
  getBaselines((err, baselines) => {
    if (err) {
      callback(err);
    } else {
      callback(null, baselines[controlId.toUpperCase()]);
    }
  });
};

exports.getBaselines = getBaselines;
exports.getBaselinesById = getBaselinesById;
exports.getBaselinesFromXML = getBaselinesFromXML;
