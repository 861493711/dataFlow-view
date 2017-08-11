function xOfPin (pinSize, width, numPins, position) {

  if(numPins === 1) return width / 2 - pinSize / 2;

  if (position === 0) return 0
  
  if (numPins > 1) return position * (width - pinSize) / (numPins - 1)
}

module.exports = exports.default = xOfPin
