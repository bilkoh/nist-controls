export default function makeControl(data) {
  let controlData = data;
  return {
    controlData: controlData,
    manicure: (fields, trim = false) => {},
  };
}
