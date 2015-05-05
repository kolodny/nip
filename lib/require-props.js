module.exports = requireProps;

function requireProps(obj, propList) {
  for (var i = 0; i < propList.length; i++) {
    if (!(propList[i] in obj)) {
      throw new Error('missing prop ' + propList[i]);
    }
  }
}
