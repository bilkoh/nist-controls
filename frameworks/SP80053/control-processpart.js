exports.makeControl = (data) => {
  const _ = require("lodash");
  let controlData = data;

  const fieldFuncs = {
    controlId: () => _.get(controlData, "id"),
    title: () => _.get(controlData, "title"),
    framework: () => _.get(controlData, "class"),
    baselines: () => _.get(controlData, "baselines"),
    parent: () => {
      return {
        id: _.get(controlData, "parentId"),
        title: _.get(controlData, "parentTitle"),
      };
    },
    withdrawn: () => {
      const props = _.get(controlData, "props");
      if (props)
        if (_.find(props, { name: "status", value: "withdrawn" })) {
          return true;
        }
      return false;
    },
    guidance: () => {
      // `guidance` field is one long string, with `\n\n` separating paragraphs
      // we'll want to break it up into an array of elements per paragraph
      const renderGuidance = (guidance) => guidance.split("\n\n");

      const parts = _.get(controlData, "parts", []);
      const guidance = _.filter(parts, { name: "guidance" })[0];
      if (_.get(guidance, "prose")) {
        return renderGuidance(_.get(guidance, "prose"));
      }
    },
    statements: () => {
      // recursive function b/c statements have nested statements (parts)
      const processParts = (parts, params) => {
        const items = [];
        let label, // usually a,b,c, or 1,2,3
          prose; // holds statement with handlebars
        parts.forEach((el) => {
          if (_.get(el, "prose")) {
            label = _.get(el, "props")[0].value;
            prose = _.get(el, "prose");
          } else {
            // in this case, eg: ac-2(1), we're processing a control w/ one statement
            // in which we don't need a label
            // label = _.get(el, "props")[0].value;
            prose = parts[0];
          }

          const item = {};
          let statement;
          prose = label ? label + " " + prose : prose;
          statement = renderPlaceholders(prose, params);
          item.statement = statement;

          let subparts = _.get(el, "parts");
          if (subparts) {
            subparts = processParts(subparts, params);
            item.subparts = subparts;
          }

          items.push(item);
        });

        return items;
      };

      // `statement` field from json source uses {{handlebar}} placeholders for Assignments
      // The values for those assignments are in the parent under the `param` field
      // This function renders the `statement` object with the appropriate values from `param`
      const renderPlaceholders = (statement, params) => {
        //   const regex = /(^|[^{])\{\{[^{}]*\}\}(?!\})/gm;
        const regex = /{{([^{}]+)}}/gm;
        const t = statement.replace(regex, (m) => {
          const paramId = m.split("param,")[1].split(" ")[1];
          const paramObj = _.filter(params, { id: paramId })[0];

          const label = _.get(paramObj, "label");
          const select = _.get(paramObj, "select");
          if (label) {
            let assignment = label;
            // sometimes labels will be prefixed with 'organization-defined', other times they dont
            if (assignment.search(/^organization/) === -1)
              assignment = "organization-defined " + assignment;

            return `[Assignment: ${assignment}]`;
          } else if (select) {
            let assignment = select.choice.join(", ");
            // sometimes labels will be prefixed with 'organization-defined', other times they dont
            if (assignment.search(/^organization/) === -1)
              assignment = "organization-defined " + assignment;

            return `[Assignment (${select["how-many"]}): ${assignment}]`;
          }
        });

        return t;
      };

      // we find our statements in the parts field
      const parts = _.get(controlData, "parts", []);
      const statementData = _.filter(parts, { name: "statement" })[0];
      // param needed to replace placeholders in statements
      const params = _.get(controlData, "params");
      let statements = [];

      // statements
      if (_.get(statementData, "prose")) {
        // for single-line, the goods are in `prose` key whose value is a string
        const line = _.get(statementData, "prose");
        statements.push(line);
        statements = processParts(statements, params);
      } else if (_.isArray(_.get(statementData, "parts"))) {
        // for multi-line `statements` the goods are within in an array in the `parts` key whose value is an array
        statements = _.get(statementData, "parts");

        statements = processParts(statements, params);
      }

      return statements;
    },
  };

  const defaultFields = [
    "controlId",
    "title",
    "framework",
    "baselines",
    "parent",
    "withdrawn",
    "guidance",
    "statements",
  ];

  // optional function we run on controls to accomplish the following:
  //  - better labels of important fields
  //  - include family id and name from parent
  //  - determine if this is a withdrawn control
  //  - guidance string w/ newlines split into an array
  //  fill in assignment placeholders in statements from params object
  const render = (fields = defaultFields) => {
    const renderedControl = {};

    fields.forEach((el) => {
      const func = fieldFuncs[el];
      if (func) renderedControl[el] = func();
    });

    return renderedControl;
  };

  return {
    ...controlData,
    render: render,
  };
};
