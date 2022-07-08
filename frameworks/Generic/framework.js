export default function makeFramework(data) {
  let frameworkData = data;
  return {
    frameworkData: frameworkData,
    getControls: () => {},
    getControlById: (controlId) => {},
  };
}
