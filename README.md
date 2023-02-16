# nist-controls

An npm module to access NIST framework controls.

## The Problem:

There are plenty of sources nist for controls: pdfs, websites, excel spread sheets. [(See NIST Data Sources)](#NIST-Data-Sources)

I wanted to plug these controls into various tools like excel for policy analysis. But the data sources for nist controls were porblematic... missing fields, inconsistent labels, missing baselines, etc. So I developed this npm package.

## How To Use:

This package can work as cli script or as a library.

### Script

Run this in your console to spit out a csv file for all NIST 800-53 controls:

```
npx nist-controls --framework SP80053 --format csv --output entire_nist_80053_framework.csv
```

If you open `entire_nist_80053_framework.csv` in excel it would look something like this:
![csv-output-screenshot](https://user-images.githubusercontent.com/43228593/219292270-78c9476b-c2c4-4c7f-b8a6-f35ca3dee731.png)

### Library

If you want to use this as a library, check out the examples below:

```Javascript
const SP80053 = require("nist-controls").SP80053;
const sp = SP80053();

// Get a list of all controls including enhancements
sp.getControls((err, el) => {
  console.dir(el, { depth: 2 });
});

// Get a list of all controls excluding enhancements
sp.getControls((err, el) => {
  console.dir(el, { depth: 2 });
}, false);

// Get a specific control
sp.getControlById("AC-2", (err, el) => {
  console.dir(el, { depth: null });
});

// So far we've been returning the raw data from the various data source
// it has everything you need, but all that data is nested within each other
// or poorly labelled, and the statements have handlebar placeholder
// instead of the proper [Assignments]
//
// But the control returns has an render() function
// when called it it returns a cleaned up object that clearer and cleaner
sp.getControlById("AC-2", (err, el) => {
  console.dir(el.render(), { depth: null });
});
```

## NIST Data Sources:

You can find the SP 800-53 Controls in Different Data Formats:
http://csrc.nist.gov/Projects/risk-management/sp800-53-controls/downloads

### JSON

https://raw.githubusercontent.com/usnistgov/oscal-content/main/nist.gov/SP800-53/rev5/json/NIST_SP-800-53_rev5_catalog-min.json

This was probably the most comprehensive data source, but it had baselines missing, and all the `[Assignment/Select]` variables were were filled with place holders.

### CSV

https://csrc.nist.gov/CSRC/media/Projects/risk-management/800-53%20Downloads/800-53r5/NIST_SP-800-53_rev5_catalog_load.csv

Only has `identifier,name,control_text,discussion,related` and statements had weird formatting.

### XML

https://csrc.nist.gov/CSRC/media/Projects/risk-management/800-53%20Downloads/800-53r5/SP_800-53_v5_1_XML.xml

Missing parent info.

## Todo

- Add CSF framework
