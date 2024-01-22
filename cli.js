#!/usr/bin/env node

// Options TODO:
// show-enhancements
// sortby [either family or by control]
// exclude-ctrl
// exclude-family

const yargs = require("yargs");

const options = yargs
  .usage("Usage: $0 [options]")
  .option("withdrawn", {
    describe: "Show withdrawn controls",
    type: "boolean",
    default: false,
  })
  .option("output", {
    describe: "Output file",
    type: "string",
    demandOption: true,
  })
  .option("format", {
    describe: "Output file format",
    type: "string",
    choices: ["CSV", "JSON"],
    default: "CSV",
    coerce: (opt) => opt.toUpperCase(),
  })
  .option("verbose", {
    describe: "Print verbose output",
    type: "boolean",
    default: false,
  })
  .option("framework", {
    describe: "Select one framework",
    type: "string",
    choices: ["SP80053"],
    default: "SP80053",
    coerce: (opt) => opt.toUpperCase(),
  })
  .option("debug", {
    describe: "Enable debug mode",
    type: "boolean",
    default: false,
  })
  .help().argv;

if (options.debug) {
  console.dir(options);
}

const _ = require("lodash");
const SP80053 = require("./index").SP80053;
const sp = SP80053();

if (options.framework == "SP80053") {
  const columns = [
    "framework",
    "parent",
    "controlId",
    "baselines",
    "title",
    "statements",
    // "enhancements",
  ];
  sp.getControls((err, el) => {
    try {
      switch (options.format) {
        case "JSON":
          // Handle json format
          let jsonArray = el;
          saveOutput(options.output, JSON.stringify(jsonArray));
          break;
        case "CSV":
          // Handle csv format
          let csvArray = el.map((ctl) => {
            const renderedCtl = ctl.render();
            const row = [];

            row.push(renderedCtl.framework);
            row.push(renderedCtl.parent.title);
            row.push(renderedCtl.controlId);
            row.push(renderedCtl.baselines.join(","));
            row.push(renderedCtl.title);
            row.push(generateStatementList(renderedCtl.statements).join("\n"));

            return row;
          });

          csvArray = [...[columns], ...csvArray];

          const output = arrayToCSV(csvArray);

          saveOutput(options.output, output);
          break;
        default:
          // Handle unknown format
          console.log("Unknown format: " + options.format);
      }
    } catch (err) {
      console.error(err);
    }
  });
}

const generateStatementList = (arr) => {
  if (!arr) return arr;
  return arr.map((e, i) => {
    const st = e.statement + "\n";
    let sub = "";
    if (e.subparts) {
      sub = generateStatementList(e.subparts);
      if (_.isArray(sub)) sub = sub.join("");
    }

    return st + sub;
  });
};

const arrayToCSV = (arr) => {
  const rows = [];
  for (const row of arr) {
    const rowStr = row.map((val) => `"${val}"`).join(",");
    rows.push(rowStr);
  }
  return rows.join("\n");
};

const saveOutput = (filename, output) => {
  const fs = require("fs");

  fs.writeFile(filename, output, (err) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log("Output saved to: ", filename);
  });
};
