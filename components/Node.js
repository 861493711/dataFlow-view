var inherits = require('inherits');
var React = require('react');
var PropTypes = require('prop-types');

var Component = React.Component;

var no = require('not-defined');

var computeNodeWidth = require('../utils/computeNodeWidth');
var ignoreEvent = require('../utils/ignoreEvent');
var xOfPin = require('../utils/xOfPin');
var theme = require('./theme');

var minus = pinSize => 'M 0 ' + pinSize / 3 + ' V ' + 2 * pinSize / 3 + ' H ' + pinSize + ' V ' + pinSize / 3 + ' Z';

var plus = pinSize => 'M 0 ' + pinSize / 3 + ' V ' + 2 * pinSize / 3 + ' H ' + pinSize / 3 + ' V ' + pinSize + ' H ' + 2 * pinSize / 3 + ' V ' + 2 * pinSize / 3 + ' H ' + pinSize + ' V ' + pinSize / 3 + ' H ' + 2 * pinSize / 3 + ' V ' + 0 + ' H ' + pinSize / 3 + ' V ' + pinSize / 3 + ' Z';

function Node() {
  Component.apply(this, arguments);
}

inherits(Node, Component);
//修改参数 getBody() ---> getbody(width,isInverse,hasChips)
//旋转
  function getBody(width,isInverse,hasChips) {
    var _props = this.props,
        fontSize = _props.fontSize,
        theme = _props.theme,
        text = _props.text;
    var pinSize = theme.pinSize;

    var bodyHeight = this.getBodyHeight();

    var margin = fontSize * 0.2;

    var textSize = 6;

    var marginChips = 0;
//修改node高度引起的变化
    if(!hasChips){
      if(isInverse){
        marginChips = -2;
      }else{
        marginChips = pinSize/2-1;
      }
    }
    //名字居中
    if(isInverse){
      var tspanArr = [];
      for(var i = 0;i < text.length;i++){
        var ts = React.createElement('tspan',{key:'tsi'+i,x: pinSize + margin + marginChips,dy:textSize + 1}, text[i]);
        tspanArr.push(ts);
      }
      var y = (width - (textSize+1) * text.length) / 2;
      return React.createElement('text', {
      x: pinSize + margin,
      y: y
    }, tspanArr);
    }else{
      var tspanArr = [];
      for(var i = 0;i < text.length;i++){
        var ts = React.createElement('tspan',{key:'ts'+i,y: pinSize + margin + marginChips,dx:0}, text[i]);
        tspanArr.push(ts);
      }
      var x = (width - textSize * text.length) / 2;
      return React.createElement('text', {
      x: x,
      y: bodyHeight + pinSize - margin
    }, tspanArr);
    }
  }

Node.prototype.getBody = getBody;

function getBodyHeight() {
  var _props2 = this.props,
      bodyHeight = _props2.bodyHeight,
      theme = _props2.theme;


  return bodyHeight || theme.nodeBodyHeight;
}

Node.prototype.getBodyHeight = getBodyHeight;

function getComputedWidth() {
  var _props3 = this.props,
      fontSize = _props3.fontSize,
      ins = _props3.ins,
      outs = _props3.outs,
      text = _props3.text,
      theme = _props3.theme,
      //旋转
      isInverse = _props3.isInverse,
      //属性
      nodeProp = _props3.nodeProp,
      width = _props3.width;
      // console.log(_props3);
  var pinSize = theme.pinSize;


  var bodyHeight = this.getBodyHeight();

  var computedWidth = computeNodeWidth({
    bodyHeight: bodyHeight,
    pinSize: pinSize,
    fontSize: fontSize,
    //旋转
    node: { ins: ins, outs: outs, text: text, width: width,nodeProp:nodeProp,isInverse:isInverse}
  });

  return computedWidth;
}

Node.prototype.getComputedWidth = getComputedWidth;

function getDeleteButton() {
  var _props4 = this.props,
      deleteNode = _props4.deleteNode,
      id = _props4.id,
      multiSelection = _props4.multiSelection,
      selected = _props4.selected,
      theme = _props4.theme;
  var primaryColor = theme.primaryColor,
      pinSize = theme.pinSize;


  if (selected === false || multiSelection) return null;

  return React.createElement('path', {
    d: 'M 0 ' + pinSize / 3 + ' V ' + 2 * pinSize / 3 + ' H ' + pinSize / 3 + ' V ' + pinSize + ' H ' + 2 * pinSize / 3 + ' V ' + 2 * pinSize / 3 + ' H ' + pinSize + ' V ' + pinSize / 3 + ' H ' + 2 * pinSize / 3 + ' V ' + 0 + ' H ' + pinSize / 3 + ' V ' + pinSize / 3 + ' Z',
    fill: primaryColor,
    //点突出
    transform: 'translate(' + pinSize / 2 + ',' + pinSize / 2 + ') rotate(45) translate(' + (-3 * pinSize / 2 - pinSize) + ',' + pinSize / 2 + ')',
    onMouseDown: () => deleteNode(id)
  });
}

Node.prototype.getDeleteButton = getDeleteButton;

function getInputMinus() {
  var _props5 = this.props,
      deleteInputPin = _props5.deleteInputPin,
      id = _props5.id,
      ins = _props5.ins,
      multiSelection = _props5.multiSelection,
      selected = _props5.selected,
      theme = _props5.theme;
  var primaryColor = theme.primaryColor,
      pinSize = theme.pinSize;


  if (no(ins) || selected === false || multiSelection) return null;

  var computedWidth = this.getComputedWidth();
  var disabled = ins.length === 0;

  return React.createElement('path', {
    d: minus(pinSize),
    fill: disabled ? 'transparent' : primaryColor,
    onMouseDown: () => {
      if (!disabled) deleteInputPin(id);
    },
    stroke: primaryColor,
    transform: 'translate(' + (computedWidth + 2) + ',0)'
  });
}

Node.prototype.getInputMinus = getInputMinus;

function getInputPlus() {
  var _props6 = this.props,
      createInputPin = _props6.createInputPin,
      id = _props6.id,
      ins = _props6.ins,
      multiSelection = _props6.multiSelection,
      selected = _props6.selected,
      theme = _props6.theme;
  var primaryColor = theme.primaryColor,
      pinSize = theme.pinSize;


  if (no(ins) || selected === false || multiSelection) return null;

  var computedWidth = this.getComputedWidth();

  return React.createElement('path', {
    d: plus(pinSize),
    fill: primaryColor,
    onMouseDown: () => createInputPin(id),
    stroke: primaryColor,
    transform: 'translate(' + (computedWidth + 4 + pinSize) + ',0)'
  });
}

Node.prototype.getInputPlus = getInputPlus;

function getOutputMinus() {
  var _props7 = this.props,
      deleteOutputPin = _props7.deleteOutputPin,
      id = _props7.id,
      multiSelection = _props7.multiSelection,
      outs = _props7.outs,
      selected = _props7.selected,
      theme = _props7.theme;
  var primaryColor = theme.primaryColor,
      pinSize = theme.pinSize;


  if (no(outs) || selected === false || multiSelection) return null;

  var bodyHeight = this.getBodyHeight();
  var computedWidth = this.getComputedWidth();
  var disabled = outs.length === 0;

  return React.createElement('path', {
    d: minus(pinSize),
    fill: disabled ? 'transparent' : primaryColor,
    onMouseDown: () => {
      if (!disabled) deleteOutputPin(id);
    },
    stroke: primaryColor,
    transform: 'translate(' + (computedWidth + 2) + ',' + (bodyHeight + pinSize) + ')'
  });
}

Node.prototype.getOutputMinus = getOutputMinus;

function getOutputPlus() {
  var _props8 = this.props,
      createOutputPin = _props8.createOutputPin,
      id = _props8.id,
      multiSelection = _props8.multiSelection,
      outs = _props8.outs,
      selected = _props8.selected,
      theme = _props8.theme;
  var primaryColor = theme.primaryColor,
      pinSize = theme.pinSize;


  if (no(outs) || selected === false || multiSelection) return null;

  var bodyHeight = this.getBodyHeight();
  var computedWidth = this.getComputedWidth();

  return React.createElement('path', {
    d: plus(pinSize),
    fill: primaryColor,
    onMouseDown: () => createOutputPin(id),
    stroke: primaryColor,
    transform: 'translate(' + (computedWidth + 4 + pinSize) + ',' + (bodyHeight + pinSize) + ')'
  });
}

Node.prototype.getOutputPlus = getOutputPlus;

function render() {
  var _props9 = this.props,
      dragging = _props9.dragging,
      draggedLinkId = _props9.draggedLinkId,
      id = _props9.id,
      ins = _props9.ins,
      onCreateLink = _props9.onCreateLink,
      outs = _props9.outs,
      selected = _props9.selected,
      selectNode = _props9.selectNode,
      theme = _props9.theme,
      updateLink = _props9.updateLink,
        //修改
      onNodeDoubleClick=_props9.onNodeDoubleClick,
      //旋转
      isInverse = _props9.isInverse,
      //属性
      nodeProp = _props9.nodeProp,
      //chips被选中
      onChipSelected = _props9.onChipSelected,
      //ctrl按下
      ctrlPressed = _props9.ctrlPressed,
      //加入选中数组
      addSelectedItem = _props9.addSelectedItem,
      x = _props9.x,
      y = _props9.y;
  //修改
  var _this = this;
  var darkPrimaryColor = theme.darkPrimaryColor,
      nodeBarColor = theme.nodeBarColor,
      pinColor = theme.pinColor,
      pinSize = theme.pinSize,
      primaryColor = theme.primaryColor;

   var bodyContent;
   var chips = null;
  var style = "";
    //类型画图
    // console.log(_props9);
   //节点高度
    var bodyHeight; 
    if(typeof(nodeProp) != 'undefined' && nodeProp != null){
        if(typeof(nodeProp.chips) != 'undefined' && nodeProp.chips != null && nodeProp.chips.length > 0){
          chips = nodeProp.chips;
          // console.log(chips);
          // console.log('进入'+nodeBodyHeight);
          //有chips的时候node的高度
          bodyHeight = 2 * this.getBodyHeight() + pinSize * 2;
          // console.log("kk1");
          // console.log(nodeProp);
        }else{
          // bodyHeight = this.getBodyHeight();
          //没有chips属性，把高度设置为字体高度
          bodyHeight = 6;
          // console.log("kk");
      }
        if(typeof(nodeProp.style) != 'undefined' && nodeProp.style != null){
          style = nodeProp.style;
        }
      }else{
        //没有nodeProp属性，也把高度设置为字体高度
          bodyHeight = 6;
      }
    var computedWidth = this.getComputedWidth();
      //节点名字
    if(isInverse){
        if(chips != null){
          bodyContent = this.getBody(computedWidth,true,true);
        }else{
          bodyContent = this.getBody(computedWidth,true,false);
        }
    }else{
        if(chips != null){
          bodyContent = this.getBody(computedWidth,false,true);
        }else{
          bodyContent = this.getBody(computedWidth,false,false);
        }
    }
    // console.log("height:" + bodyHeight + ",width:"+computedWidth);
    var inverseHeight = computedWidth;
    var inverseWidth = bodyHeight;
    // console.log(_props9);
  // if(style == "buses"){
  //       return React.createElement('g', {
  //     //修改1
  //     onDoubleClick: function(){
  //       // console.log(_props9);
  //       onNodeDoubleClick(_props9['id'],_this);
  //       return false;
  //     },
  //     onMouseDown: selectNode,
  //     style: {
  //       cursor: dragging ? 'pointer' : 'default'
  //     },
  //     transform: 'translate(' + x + ',' + y + ')'
  //   }, this.getDeleteButton(), 
  //   // this.getInputMinus(), 
  //   // this.getInputPlus(), 
  //   // this.getOutputMinus(), 
  //   // this.getOutputPlus(),
  //   //  React.createElement('rect', {
  //   //   // fill: selected ? primaryColor : nodeBarColor,
  //   //   //改颜色
  //   //   fill:'#ffffff',
  //   //   height: pinSize,
  //   //   width: computedWidth
  //   //   // height:inverseHeight,
  //   //   // width:pinSize
  //   // }), 
  //   bodyContent, React.createElement('rect', {
  //     //旋转
  //     // fill: selected ? primaryColor : nodeBarColor,
  //     //改颜色
  //     fill:'#ffffff',
  //     height: pinSize,
  //     transform: 'translate(0,' + (pinSize + bodyHeight) + ')',
  //     width: computedWidth
  //   }), outs && outs.map(function (pin, i, array) {
  //     var x = xOfPin(pinSize, computedWidth, array.length, i);
  //     // var y = xOfPin(pinSize, computedWidth, array.length, i);

  //     var onMouseDown = function (e) {
  //       e.preventDefault();
  //       e.stopPropagation();

  //       onCreateLink({ from: [id, i], to: null });
  //     };

  //     return React.createElement('rect', {
  //       key: i,
  //       fill: selected ? darkPrimaryColor : pinColor,
  //       height: pinSize,
  //       onClick: ignoreEvent,
  //       onMouseLeave: ignoreEvent,
  //       onMouseDown: onMouseDown,
  //        //点突出
  //       transform: 'translate(' + x + ',' + (pinSize + bodyHeight + pinSize)  +')',
  //       width: pinSize
  //     });
  //   }),chipsRects);
  // }
    //旋转
  if(isInverse){
    //创建chips,字体
    var chipsRects = [];
    var chipY = pinSize;
    var chipsHeight = 0;
    var textSize = 7;

    if(chips != null && chips.length > 0){
      //---计算所有chips的height---
      for(var i = 0;i < chips.length; i++){
        var chipHeight = chips[i]['name'].length * textSize + 2 * pinSize / 2;
        chipHeight = Math.max(chipHeight,30);
        chipsHeight += chipHeight;
      }
      chipsHeight += (chips.length - 1) * pinSize;
      //---计算所有chips的height---
      chipY = (inverseHeight - chipsHeight) / 2;
      var marginTop = chipY;
      var textY = 0;
      textY = textY + marginTop;
      // console.log(chipsWidth,computedWidth,chipX);
      // 循环画rect图
      for(var j = 0;j < chips.length;j++){
        //每个chip的height
        var chipHeight = chips[j]['name'].length * textSize + 2 * pinSize / 2;
        chipHeight = Math.max(chipHeight,30);

        var chip = chips[j];
        var text = chips[j]['name'];
        var tspanArr = [];
        //计算每个chip中字符串的长度
        for(var k = 0;k < text.length;k++){
          var ts = React.createElement('tspan',{key:"tsp"+k,x:pinSize * 4 + 2,dy:textSize}, text[k]);
          tspanArr.push(ts);
        }
        var marginChip = (chipHeight - textSize * text.length) / 2;
        //textY 加上 字符串距离chip上边界的距离
        textY = textY + marginChip;
        var textEle = React.createElement('text', {
          key:"text"+j,
          x: pinSize * 3,
          y: textY
        }, tspanArr);
        // console.log(textEle);
        chipsRects.push(textEle);
        //chip的高度 加上 pinSize(chip之间的间隔) 减去字符串与内边界的距离
        textY += chipHeight + pinSize - marginChip;
        //闭包,解决循环变量最后都一样的问题
        chipSelected = function(j){
          return function(e){
            e.stopPropagation();
            // selectNode(e,_props9.id);
            addSelectedItem(_props9.id);
            onChipSelected(chips[j],_this,false);
            // if(ctrlPressed){
            //   onChipSelected(chips[j],_this,true);
            // }
            // console.log(ctrlPressed);
          }
        }(j);
        // 创建chipRect
        var chipRect = React.createElement('rect', {
          key: j,
          fillOpacity: 0,
          width:30,
          stroke:chip['selected'] ? darkPrimaryColor : pinColor,
          onMouseDown:chipSelected,
          // onMouseUp: onMouseUp,
          // transform: 'translate(' + chipX + ',' + (pinSize * 3) +')',
          transform: 'translate('+ (pinSize * 3) + ','+ chipY + ')',
          height : chipHeight
        },null);
        chipY += pinSize + chipHeight;
        // console.log(j);
        chipsRects.push(chipRect);
      }
    }
    //--- end chips---
      // console.log("xuanzhuan");
      return React.createElement('g', {
      //修改1
      onDoubleClick: function(){
        // console.log(_props9);
        onNodeDoubleClick(_props9['id'],_this);
        return false;
      },
      onMouseDown: selectNode,
      style: {
        cursor: dragging ? 'pointer' : 'default'
      },
      transform: 'translate(' + x + ',' + y + ')'
    }, this.getDeleteButton(), 
    // this.getInputMinus(), 
    // this.getInputPlus(), 
    // this.getOutputMinus(), 
    // this.getOutputPlus(), 
    React.createElement('rect', {
      fillOpacity: 0,
      // height: bodyHeight + 2 * pinSize,
      height:inverseHeight,
      stroke: selected ? primaryColor : nodeBarColor,
      strokeWidth: 1,
      // width: computedWidth
      width:inverseWidth + 2 * pinSize
    }), React.createElement('rect', {
      // fill: selected ? primaryColor : nodeBarColor,
      //改颜色
      fill:'#ffffff',
      // height: pinSize,
      // width: computedWidth
      height:inverseHeight,
      width:pinSize
    }), ins && ins.map(function (pin, i, array) {
      // var x = xOfPin(pinSize, computedWidth, array.length, i);
      var y = xOfPin(pinSize, computedWidth, array.length, i);
      var onMouseUp = function (e) {
        e.preventDefault();
        e.stopPropagation();

        if (draggedLinkId) {
          updateLink(draggedLinkId, { to: [id, i] });
        }
      };

      return React.createElement('rect', {
        key: i,
        fill: selected ? darkPrimaryColor : pinColor,
        height: pinSize,
        onMouseDown: ignoreEvent,
        onMouseUp: onMouseUp,
        // transform: 'translate(' + x + ',0)',
        // transform: 'translate(0,' + y + ')',
        	//点突出
        transform: 'translate('+(-pinSize)+',' + y + ')',
        width: pinSize
      });
    }), bodyContent, React.createElement('rect', {
      //旋转
      // fill: selected ? primaryColor : nodeBarColor,
      //改颜色
      fill:'#ffffff',
      // height: pinSize,
      // transform: 'translate(0,' + (pinSize + bodyHeight) + ')',
      // width: computedWidth
      width:pinSize,
      transform: 'translate(' + (pinSize + inverseWidth) + ',0)',
      height:inverseHeight
    }), outs && outs.map(function (pin, i, array) {
      // var x = xOfPin(pinSize, computedWidth, array.length, i);
      var y = xOfPin(pinSize, computedWidth, array.length, i);

      var onMouseDown = function (e) {
        e.preventDefault();
        e.stopPropagation();

        onCreateLink({ from: [id, i], to: null });
      };

      return React.createElement('rect', {
        key: i,
        fill: selected ? darkPrimaryColor : pinColor,
        height: pinSize,
        onClick: ignoreEvent,
        onMouseLeave: ignoreEvent,
        onMouseDown: onMouseDown,
        // transform: 'translate(' + x + ',' + (pinSize + bodyHeight) + ')',
        // transform: 'translate(' + (pinSize + inverseWidth) + ',' + y + ')',
            //点突出
        transform: 'translate(' + (pinSize + inverseWidth+pinSize) + ',' + y + ')',
        width: pinSize
      });
    }),chipsRects);
    }
 //创建chips,字体
    var chipsRects = [];
    var chipX = pinSize;
    var chipsWidth = 0;
    var textSize = 6;

    if(chips != null && chips.length > 0){
      for(var i = 0;i < chips.length; i++){
        var chipWidth = chips[i]['name'].length * textSize + 2 * pinSize / 2;
        chipWidth = Math.max(chipWidth,30);
        chipsWidth += chipWidth;
      }
      chipsWidth += (chips.length - 1) * pinSize;
      chipX = (computedWidth - chipsWidth) / 2;
      var marginLeft = chipX;
      var textX = 0;
      textX = textX + marginLeft;
      // console.log(chipsWidth,computedWidth,chipX);
 
      for(var j = 0;j < chips.length;j++){
        var chipWidth = chips[j]['name'].length * textSize + 2 * pinSize / 2;
        chipWidth = Math.max(chipWidth,30);

        var chip = chips[j];
        var text = chips[j]['name'];
        var tspanArr = [];
        for(var k = 0;k < text.length;k++){
          var ts = React.createElement('tspan',{key:"tsp"+k,y: pinSize * 5 - (pinSize - textSize)/2,dx:0}, text[k]);
          tspanArr.push(ts);
        }
        var marginChip = (chipWidth - textSize * text.length) / 2;
        textX = textX + marginChip;
        var textEle = React.createElement('text', {
          key:"text"+j,
          x: textX,
          y: pinSize * 4
        }, tspanArr);
        // console.log(textEle);
        chipsRects.push(textEle);
        textX += chipWidth + pinSize - marginChip;
        //闭包,解决循环变量最后都一样的问题
        chipSelected = function(j){
          return function(e){
            e.stopPropagation();
            // selectNode(e,_props9.id);
            addSelectedItem(_props9.id);
            onChipSelected(chips[j],_this,false);
          }
        }(j);
        var chipRect = React.createElement('rect', {
          key: j,
          fillOpacity: 0,
          height:30,
          stroke:chip['selected'] ? darkPrimaryColor : pinColor,
          onMouseDown:chipSelected,
          // onMouseUp: onMouseUp,
          transform: 'translate(' + chipX + ',' + (pinSize * 3) +')',
          width: chipWidth
        },null);
        chipX += pinSize + chipWidth;
        // console.log(j);
        chipsRects.push(chipRect);
      }
    }
    return React.createElement('g', {
      //修改1
      onDoubleClick: function(){
        // console.log(_props9);
        onNodeDoubleClick(_props9['id'],_this);
        return false;
      },
      onMouseDown: selectNode,
      style: {
        cursor: dragging ? 'pointer' : 'default'
      },
      transform: 'translate(' + x + ',' + y + ')'
    }, this.getDeleteButton(), 
    // this.getInputMinus(), 
    // this.getInputPlus(), 
    // this.getOutputMinus(), 
    // this.getOutputPlus(),
     React.createElement('rect', {
      fillOpacity: 0,
      height: bodyHeight + 2 * pinSize,
      // height:inverseHeight,
      stroke: selected ? primaryColor : nodeBarColor,
      strokeWidth: 1,
      width: computedWidth
      // width:inverseWidth + 2 * pinSize
    }), React.createElement('rect', {
      // fill: selected ? primaryColor : nodeBarColor,
      //改颜色
      fill:'#ffffff',
      height: pinSize,
      width: computedWidth
      // height:inverseHeight,
      // width:pinSize
    }), ins && ins.map(function (pin, i, array) {
      var x = xOfPin(pinSize, computedWidth, array.length, i);
      // var y = xOfPin(pinSize, computedWidth, array.length, i);
      var onMouseUp = function (e) {
        e.preventDefault();
        e.stopPropagation();

        if (draggedLinkId) {
          updateLink(draggedLinkId, { to: [id, i] });
        }
      };

      return React.createElement('rect', {
        key: i,
        fill: selected ? darkPrimaryColor : pinColor,
        height: pinSize,
        onMouseDown: ignoreEvent,
        onMouseUp: onMouseUp,
          //点突出
        transform: 'translate(' + x + ',' + (-pinSize) +')',
        // transform: 'translate(' + x + ',0)',
        // transform: 'translate(0,' + y + ')',
        width: pinSize
      });
    }), bodyContent, React.createElement('rect', {
      //旋转
      // fill: selected ? primaryColor : nodeBarColor,
      //改颜色
      fill:'#ffffff',
      height: pinSize,
      transform: 'translate(0,' + (pinSize + bodyHeight) + ')',
      width: computedWidth
    }), outs && outs.map(function (pin, i, array) {
      var x = xOfPin(pinSize, computedWidth, array.length, i);
      // var y = xOfPin(pinSize, computedWidth, array.length, i);

      var onMouseDown = function (e) {
        e.preventDefault();
        e.stopPropagation();

        onCreateLink({ from: [id, i], to: null });
      };

      return React.createElement('rect', {
        key: i,
        fill: selected ? darkPrimaryColor : pinColor,
        height: pinSize,
        onClick: ignoreEvent,
        onMouseLeave: ignoreEvent,
        onMouseDown: onMouseDown,
         //点突出
        transform: 'translate(' + x + ',' + (pinSize + bodyHeight + pinSize)  +')',
        // transform: 'translate(' + x + ',' + (pinSize + bodyHeight) + ')',
        // transform: 'translate(' + (pinSize + inverseWidth) + ',' + y + ')',
        width: pinSize
      });
    }),chipsRects);
}

Node.prototype.render = render;

Node.propTypes = {
  bodyHeight: PropTypes.number,
  createInputPin: PropTypes.func.isRequired,
  createOutputPin: PropTypes.func.isRequired,
  deleteInputPin: PropTypes.func.isRequired,
  deleteNode: PropTypes.func.isRequired,
  deleteOutputPin: PropTypes.func.isRequired,
  dragging: PropTypes.bool.isRequired,
  draggedLinkId: PropTypes.string,
  fontSize: PropTypes.number.isRequired,
  id: PropTypes.string,
  ins: PropTypes.array,
  multiSelection: PropTypes.bool.isRequired,
  outs: PropTypes.array,
  onCreateLink: PropTypes.func.isRequired,
  selected: PropTypes.bool.isRequired,
  //修改
  onNodeDoubleClick:PropTypes.func.isRequired,
  //属性
  nodeProp:PropTypes.object,
  //旋转
  isInverse:PropTypes.bool,
  //chips被选中
  onChipSelected:PropTypes.func.isRequired,
  //ctrl按下
  ctrlPressed:PropTypes.bool,
  //加入选中数组
  addSelectedItem:PropTypes.func,  
  selectNode: PropTypes.func.isRequired,
  text: PropTypes.string.isRequired,
  theme: theme.propTypes,
  updateLink: PropTypes.func.isRequired,
  width: PropTypes.number,
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired
};

Node.defaultProps = {
  createInputPin: Function.prototype,
  createOutputPin: Function.prototype,
  deleteInputPin: Function.prototype,
  deleteNode: Function.prototype,
  deleteOutputPin: Function.prototype,
  dragging: false,
  draggedLinkId: null,
  multiSelection: false,
  onCreateLink: Function.prototype,
  selected: false,
  selectNode: Function.prototype,
  //修改
  onNodeDoubleClick:Function.prototype,
  //属性
  nodeProp:null,
  //按键alt
  isInverse:false,
  //chips被选中
  onChipSelected:Function.prototype,
  //ctrl按下
  ctrlPressed:false,
  //加入选中数组
  addSelectedItem:Function.prototype,
  text: 'Node',
  theme: theme.defaultProps,
  updateLink: Function.prototype
};

module.exports = exports.default = Node;