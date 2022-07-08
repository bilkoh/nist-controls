const assert = require("assert");
const SP80053 = require("../index").SP80053;

const sp = SP80053();

describe("Testing SP80053 framework", () => {
  it("getControls w/ enhancements = false -- should return 322 controls", (done) => {
    sp.getControls((err, el) => {
      try {
        assert.equal(el.length, 322);
        done();
      } catch (e) {
        done(e);
      }
    }, false);
  });

  it("getControls w/ enhancements = true -- should return 1189 controls", (done) => {
    sp.getControls((err, el) => {
      try {
        assert.equal(el.length, 1189);
        done();
      } catch (e) {
        done(e);
      }
    }, true);
  });

  it("getControlById -- both 'AC-2.1' and 'AC-2(1)' return the same object", (done) => {
    sp.getControlById("AC-2.1", (err, el) => {
      const dotNotation = el;
      sp.getControlById("AC-2(1)", (err, el) => {
        try {
          assert(el, dotNotation);
          done();
        } catch (e) {
          done(e);
        }
      });
    });
  });

  it("getControlById -- enhancement = false will return error when searching for 'AC-2.1'", (done) => {
    sp.getControlById(
      "AC-2(1)",
      (err, el) => {
        try {
          assert(err instanceof Error);
          done();
        } catch (e) {
          done(e);
        }
      },
      false
    );
  });

  it("getControlById -- baselines", (done) => {
    sp.getControlById(
      "AC-2(1)",
      (err, el) => {
        try {
          assert.deepEqual(el.baselines, ["MODERATE", "HIGH"]);
          done();
        } catch (e) {
          done(e);
        }
      },
      true
    );
  });

  it("render -- ensure all rendered statements have handlebars parsed/replaced", (done) => {
    sp.getControls((err, el) => {
      try {
        let handlebarsFound = el.map((ctl) => {
          const renderedCtl = ctl.render(["controlId", "statements"]);
          const needle = new RegExp(/{{([^{}]+)}}/, "i");
          const hay = JSON.stringify(renderedCtl.statements);
          const match = hay.match(needle);
          if (match) return renderedCtl.controlId;
          else return null;
        });
        handlebarsFound = handlebarsFound.filter((el) => {
          if (el) return true;
          return false;
        });

        if (handlebarsFound.length > 0) {
          done("Handlebars found: " + JSON.stringify(handlebarsFound));
        } else {
          done();
        }
      } catch (err) {
        done(err);
      }
    }, false);
  });

  it("render -- check related", (done) => {
    // prettier-ignore
    const relatedTest = ['ac-3',  'ac-5',  'ac-6',  'ac-17','ac-18', 'ac-20', 'ac-24', 'au-2','au-12', 'cm-5',  'ia-2',  'ia-4','ia-5',  'ia-8',  'ma-3',  'ma-5','pe-2',  'pl-4',  'ps-2',  'ps-4','ps-5',  'ps-7',  'pt-2',  'pt-3','sc-7',  'sc-12', 'sc-13', 'sc-37']
    sp.getControlById(
      "AC-2",
      (err, el) => {
        try {
          const renderedCtl = el.render();
          assert.deepEqual(renderedCtl.related, relatedTest);
          done();
        } catch (err) {
          done(err);
        }
      },
      true
    );
  });
});
