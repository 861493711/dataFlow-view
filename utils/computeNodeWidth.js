function computeNodeWidth (arg) {
  var bodyHeight = arg.bodyHeight; // It is used only to make shapes default to square.
    var pinSize = arg.pinSize;
    var fontSize = arg.fontSize;
    var node = arg.node;
    //类型画图
    var nodeProp = node.nodeProp;
  
    var chips = null;
    if(typeof(nodeProp) != 'undefined' && nodeProp != null){
      if(typeof(nodeProp.chips) != 'undefined' && nodeProp.chips != null){
        chips = nodeProp.chips;
        // console.log(chips);
      }
    }

    var ins = node.ins || [];
    var outs = node.outs || [];
    var text = node.text;
    var width = node.width;
    //旋转
    var isInverse = node.isInverse;
    // console.log(isInverse);

    // Node shape defaults to a square.
    var defaultWidth = width || bodyHeight + pinSize * 2;
  
    // Heuristic value, based on Courier font.
    var fontAspectRatio = 0.64;

    // The with required to fit the node text.
    var textWidth = pinSize * 2 + text.length * fontSize * fontAspectRatio;

    // The greatest number of pins, by type (ins or outs).
    var numPins = Math.max(ins.length, outs.length

    // The width required to fit the most numerous pins.
    );
    var pinsWidth = numPins * pinSize * 2;

    var dynamicWidth = Math.max(textWidth, pinsWidth);

    var computedWidth = Math.max(defaultWidth, dynamicWidth);

    var inverseHeight;
    var chipsWidth = 0;
    var defaultChipWidth = 30;

    //判断节点名字长度与计算长度哪个大
    if(isInverse){
      if(chips != null){
        for(var i = 0;i < chips.length; i++){
          var chipWidth = chips[i]['name'].length * 7 + 2 * pinSize / 2;
          chipWidth = Math.max(chipWidth,defaultChipWidth);
          chipsWidth += chipWidth;
        }
        chipsWidth += (chips.length - 1) * pinSize;
        chipsWidth += pinSize * 2;
        // console.log(computedWidth);
      }
      inverseHeight = text.length * 7 + 2 * pinSize;
      // return Math.max(defaultWidth,inverseHeight);
      computedWidth = Math.max(computedWidth,inverseHeight);
    }else{
      if(chips != null){
        for(var i = 0;i < chips.length; i++){
          var chipWidth = chips[i]['name'].length * 6 + 2 * pinSize / 2;
          chipWidth = Math.max(chipWidth,defaultChipWidth);
          chipsWidth += chipWidth;
        }
        chipsWidth += (chips.length - 1) * pinSize;
        chipsWidth += pinSize * 2;
        // console.log(computedWidth);
      }
    }
    computedWidth = Math.max(computedWidth,chipsWidth);

    return computedWidth;
}

module.exports = exports.default = computeNodeWidth
