var EventEmitter = require('events');
var inherits = require('inherits');
var no = require('not-defined');
var React = require('react');
var ReactDOM = require('react-dom');
var svgx = require('svgx');

var Frame = require('./components/Frame');
var randomString = require('./utils/randomString');

var reactDOMServer = require('react-dom/server');

var idLength = 3;
var defaultItem = Frame.defaultProps.item;

function Canvas(containerId, item) {
  EventEmitter.apply(this, arguments);
  
  if (no(item)) item = defaultItem;
  if (no(item.link)) item.link = defaultItem.link;
  if (no(item.link.DefaultLink)) item.link = defaultItem.link.DefaultLink;
  if (no(item.node)) item.node = defaultItem.node;
  if (no(item.node.DefaultNode)) item.node.DefaultNode = defaultItem.node.DefaultNode;
  if (no(item.nodeList)) item.nodeList = defaultItem.nodeList;
  if (no(item.util)) item.util = defaultItem.util;

  this.item = item;

  if (typeof containerId !== 'string') {
    throw new TypeError('containerId must be a string', containerId);
  }

  if (typeof document !== 'undefined') {
    var container = document.getElementById(containerId);

    if (container === null) {
      container = document.createElement('div');
      container.id = containerId;

      container.setAttribute('style', 'display: inline-block; height: 400px; width: 100%;');

      document.body.appendChild(container);
    }

    this.container = container;
  } else {
    this.container = null;
  }
}

inherits(Canvas, EventEmitter);

function render(view, model, callback) {
  var container = this.container;
  var item = this.item;
 //修改
  this.view = view;
  view.isDestroyed = true;
  var height;
  var width;
  var _this = this;
  if (container) {
    var border = 1;
    var rect = container.getBoundingClientRect();

    height = rect.height - 2 * border;
    width = rect.width - 2 * border;
  }

  if (no(view.height)) view.height = height;
  if (no(view.link)) view.link = {};
  if (no(view.node)) view.node = {};
  if (no(view.width)) view.width = width;

  var createInputPin = (nodeId, pin) => {
    var ins = view.node[nodeId].ins;

    if (no(ins)) view.node[nodeId].ins = ins = [];

    var position = ins.length;

    if (no(pin)) pin = 'in' + position;

    this.emit('createInputPin', nodeId, position, pin);

    view.node[nodeId].ins.push(pin);
  };

  var createOutputPin = (nodeId, pin) => {
    var outs = view.node[nodeId].outs;

    if (no(outs)) view.node[nodeId].outs = outs = [];

    var position = outs.length;

    if (no(pin)) pin = 'out' + position;

    this.emit('createOutputPin', nodeId, position, pin);

    view.node[nodeId].outs.push(pin);
  };

  var selectLink = id => {
    this.emit('selectLink', id);
  };

  var selectNode = id => {
    this.emit('selectNode', id);
  };
  //修改1
  var onNodeDoubleClick = (nodeId,node) => {
    this.emit('onNodeDoubleClick',nodeId,node);
  }
   //旋转事件
  var onNodeInversed = (nodeId,node) => {
    this.emit('onNodeInversed',nodeId,node);
  }
  //chips被选中
  var onChipSelected = function(chip,node,isMultiChioce){
    // console.log(view.node);
    //取消选中chips
    // var nodes = view.node;
    // var nodeIds = Object.keys(view.node);
    // nodeIds.map(function(id,index,arr){
    //   // console.log(nodes[id]);
    //   if(typeof(nodes[id].nodeProp) == 'undefined' && nodes[id].nodeProp == null){
    //     return;
    //   }
    //   // console.log(nodes[id].nodeProp);
    //   if(typeof(nodes[id].nodeProp.chips) == 'undefined'){
    //     return;
    //   }
    //   var chips = nodes[id].nodeProp.chips;
    //   for(var i = 0;i < chips.length;i++){
    //         // console.log("设置")
    //         chips[i]['selected'] = false;
    //   }
    // });
    // console.log(chip.name);
    var chips = view.node[node.props.id].nodeProp.chips;
    for(var i = 0;i < chips.length;i++){
      if(chips[i]['name'] === chip.name){
        // console.log(chips[i]['selected']);
            chips[i]['selected'] = !chips[i]['selected'];
      }
    }
    _this.emit('onChipSelected',chip,node);
  }
  //ctrl键的keyup事件
  var onMultiChoice = function(selectedItems){
    var selectedNodeNames = [];
    var selectedNodes = [];
    // var selectedChips = [];
    Object.keys(view.node).map(function(id,index,arr){
      var index = selectedItems.indexOf(id);
      if(index > -1){
        selectedNodeNames.push(id);
        selectedNodes.push(view.node[id]);
      }
    });
    
     _this.emit("onMultiChoice",selectedNodeNames,selectedNodes);
  }

  function generateId() {
    var id = randomString(idLength);

    return view.link[id] || view.node[id] ? generateId() : id;
  }

  var createLink = link => {
    var from = link.from;
    var to = link.to;

    var id = generateId();

    if (no(to)) {
      view.link[id] = { from: from };
    } else {
      view.link[id] = { from: from, to: to };

      this.emit('createLink', { from: from, to: to }, id);
    }

    return id;
  };

  var createNode = node => {
    var id = generateId();

    view.node[id] = node;

    this.emit('createNode', node, id);

    return id;
  };

  var deleteLink = id => {
    this.emit('deleteLink', id);

    delete view.link[id];
  };

  var deleteNode = id => {
    Object.keys(view.link).forEach(linkId => {
      var from = view.link[linkId].from;
      var to = view.link[linkId].to;

      if (from && from[0] === id) {
        deleteLink(linkId);
      }

      if (to && to[0] === id) {
        deleteLink(linkId);
      }
    });

    delete view.node[id];

    this.emit('deleteNode', id);
  };

  var dragItems = (dragginDelta, draggedItems) => {
    Object.keys(view.node).filter(id => draggedItems.indexOf(id) > -1).forEach(id => {
      view.node[id].x += dragginDelta.x;
      view.node[id].y += dragginDelta.y;
    });
  };

  var deleteInputPin = (nodeId, position) => {
    var ins = view.node[nodeId].ins;

    if (no(ins)) return;
    if (ins.length === 0) return;

    if (no(position)) position = ins.length - 1;

    Object.keys(view.link).forEach(id => {
      var to = view.link[id].to;

      if (no(to)) return;

      if (to[0] === nodeId && to[1] === position) {
        deleteLink(id);
      }
    });

    this.emit('deleteInputPin', nodeId, position);

    view.node[nodeId].ins.splice(position, 1);
  };

  var endDragging = selectNodes => {
    var nodesCoordinates = {};

    selectNodes.forEach(id => {
      nodesCoordinates.id = {};
      nodesCoordinates.id.x = view.node[id].x;
      nodesCoordinates.id.y = view.node[id].y;
    });

    this.emit('endDragging', nodesCoordinates);
  };

  var deleteOutputPin = (nodeId, position) => {
    var outs = view.node[nodeId].outs;

    if (no(outs)) return;
    if (outs.length === 0) return;

    if (no(position)) position = outs.length - 1;

    Object.keys(view.link).forEach(id => {
      var from = view.link[id].from;

      if (no(from)) return;

      if (from[0] === nodeId && from[1] === position) {
        deleteLink(id);
      }
    });

    this.emit('deleteOutputPin', nodeId, position);

    view.node[nodeId].outs.splice(position, 1);
  };

  var renameNode = (nodeId, text) => {
    view.node[nodeId].text = text;
  };

  var updateLink = (id, link) => {
    var to = link.to;
    var from = link.from;

    if (no(from)) {
      view.link[id].to = to;

      this.emit('createLink', view.link[id], id);
    }
  };

  var component = React.createElement(Frame, {
    createInputPin: createInputPin,
    createOutputPin: createOutputPin,
    createLink: createLink,
    createNode: createNode,
    deleteLink: deleteLink,
    deleteInputPin: deleteInputPin,
    deleteNode: deleteNode,
    deleteOutputPin: deleteOutputPin,
    dragItems: dragItems,
    endDragging: endDragging,
    item: item,
    model: model,
    nodeList: item.nodeList,
    renameNode: renameNode,
    selectLink: selectLink,
    selectNode: selectNode,
    updateLink: updateLink,
    //修改
    onNodeDoubleClick:onNodeDoubleClick,
    //chips被选中
    onChipSelected:onChipSelected,
    //旋转事件
    onNodeInversed:onNodeInversed,
    //ctrl按键的keyup事件
    onMultiChoice:onMultiChoice,
    canvas:_this,
    view: view
  });
  //销毁canvas和解绑事件
  _this.destroy = function(){
    _this.removeAllListeners();
    document.removeEventListener('keydown',_this.keydown);
    document.removeEventListener('keyup',_this.keyup);
    window.removeEventListener('scroll',_this.scroll);
    window.removeEventListener('resize',_this.resize);
    ReactDOM.unmountComponentAtNode(container);
}
  if (container) {
    ReactDOM.render(component, container);
  } else {
    var opts = { doctype: true, xmlns: true };

    var jsx = React.createElement(Frame, {
      item: item,
      view: view
    });

    var outputSVG = svgx(reactDOMServer.renderToStaticMarkup)(jsx, opts);

    if (typeof callback === 'function') {
      callback(null, outputSVG);
    }
  }
}

Canvas.prototype.render = render;

module.exports = exports.default = Canvas;