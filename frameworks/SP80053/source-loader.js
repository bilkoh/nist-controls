const fs = require("fs");
const path = require("path");
const SOURCE_PATH = path.resolve(__dirname, "./source-data/");

const fileCache = {};
const getFileFromCache = (filename, cb) => {
  if (fileCache[filename]) {
    return cb(null, fileCache[filename]);
  }

  fs.readFile(filename, "utf8", (err, data) => {
    if (err) {
      return cb(err);
    }

    fileCache[filename] = data;
    return cb(null, data);
  });
};

exports.sp80053ControlsJSON = () => {
  return require(SOURCE_PATH + "/NIST_SP-800-53_rev5_catalog-min.json").catalog
    .groups;
};

exports.sp80053ControlsXML = (callback) => {
  const sourcePath = SOURCE_PATH + "/SP_800-53_v5_1_XML.xml";
  const xml2js = require("xml2js");
  const parser = new xml2js.Parser();

  getFileFromCache(sourcePath, (err, data) => {
    if (err) return callback(err);
    parser.parseString(data, (err, res) => {
      if (err) return callback(err);
      return callback(null, res["controls:controls"]["controls:control"]);
    });
  });
};

const parseCSV = (str) => {
  var arr = [];
  var quote = false;
  for (var row = (col = c = 0); c < str.length; c++) {
    var cc = str[c],
      nc = str[c + 1];
    arr[row] = arr[row] || [];
    arr[row][col] = arr[row][col] || "";

    if (cc == '"' && quote && nc == '"') {
      arr[row][col] += cc;
      ++c;
      continue;
    }
    if (cc == '"') {
      quote = !quote;
      continue;
    }
    if (cc == "," && !quote) {
      ++col;
      continue;
    }
    if (cc == "\n" && !quote) {
      ++row;
      col = 0;
      continue;
    }

    arr[row][col] += cc;
  }

  return arr;
};

const addHeadersAsKeys = (parsedCsvArray, schema = false) => {
  const headers = parsedCsvArray.shift();

  const newCsvArray = [];
  parsedCsvArray.forEach((element, index) => {
    const rowObject = {};
    headers.forEach((e, i) => {
      if (e && e !== "\r") {
        let key;
        if (schema) {
          key = schema[e];
        } else {
          key = e;
        }
        rowObject[key] = element[i];
      }
    });

    newCsvArray.push(rowObject);
  });

  return newCsvArray;
};

exports.sp80053ControlsCSV = (callback) => {
  const sourcePath = SOURCE_PATH + "/NIST_SP-800-53_rev5_catalog_load.csv";
  const fs = require("fs");

  getFileFromCache(sourcePath, (err, data) => {
    if (err) return callback(err);
    return callback(null, addHeadersAsKeys(parseCSV(data.toString())));
  });
};

exports.sp80053BaselinesLow = (callback) => {
  const sourcePath =
    SOURCE_PATH +
    "/baselines/NIST_SP-800-53_rev5_LOW-baseline_profile_load.csv";
  const fs = require("fs");

  getFileFromCache(sourcePath, (err, data) => {
    if (err) return callback(err);
    return callback(null, parseCSV(data.toString()));
  });
};

exports.sp80053BaselinesModerate = (callback) => {
  const sourcePath =
    SOURCE_PATH +
    "/baselines/NIST_SP-800-53_rev5_MODERATE-baseline_profile_load.csv";
  const fs = require("fs");

  getFileFromCache(sourcePath, (err, data) => {
    if (err) return callback(err);
    return callback(null, parseCSV(data.toString()));
  });
};

exports.sp80053BaselinesHigh = (callback) => {
  const sourcePath =
    SOURCE_PATH +
    "/baselines/NIST_SP-800-53_rev5_HIGH-baseline_profile_load.csv";
  const fs = require("fs");

  getFileFromCache(sourcePath, (err, data) => {
    if (err) return callback(err);
    return callback(null, parseCSV(data.toString()));
  });
};

exports.sp80053BaselinesPrivacy = (callback) => {
  const sourcePath =
    SOURCE_PATH +
    "/baselines/NIST_SP-800-53_rev5_PRIVACY-baseline_profile_load.csv";
  const fs = require("fs");

  getFileFromCache(sourcePath, (err, data) => {
    if (err) return callback(err);
    return callback(null, parseCSV(data.toString()));
  });
};
