var inherits = require('inherits');
var no = require('not-defined');
var PropTypes = require('prop-types');
var React = require('react');
var ReactDOM = require('react-dom');

var Component = React.Component;

var computeNodeWidth = require('../utils/computeNodeWidth');
var ignoreEvent = require('../utils/ignoreEvent');
var xOfPin = require('../utils/xOfPin');

var DefaultLink = require('./Link');
var DefaultNode = require('./Node');
var Selector = require('./Selector');
var theme = require('./theme');
//--- 系统鼠标右键 ----
//禁止系统右键菜单
function forbidRight(){
　　　　　　　if (window.Event) 
                document.captureEvents(Event.MOUSEUP); 
            function nocontextmenu() 
            {
                event.cancelBubble = true
                event.returnValue = false;
                return false;
            }
            function norightclick(e) 
            {
                if (window.Event) 
                {
                      if (e.which == 2 || e.which == 3)
                       return false;
                }
                else if (event.button == 2 || event.button == 3)
                {
                       event.cancelBubble = true
                       event.returnValue = false;
                       return false;
                }
            }
            document.oncontextmenu = nocontextmenu;  // for IE5+
            document.onmousedown = norightclick;  // for all others
　　　　}
//开启系统右键菜单
function enableRight(){
  　if (window.Event) 
                document.captureEvents(Event.MOUSEUP); 
            function nocontextmenu() 
            {
               event.cancelBubble = false;
               event.returnValue = true;
               return true;
            }
            function norightclick(e) 
            {
                if (window.Event) 
                {
                      if (e.which == 2 || e.which == 3)
                       return true;
                }
                else if (event.button == 2 || event.button == 3)
                {
                       event.cancelBubble = false;
                       event.returnValue = true;
                       return true;
                }
            }
            document.oncontextmenu = nocontextmenu;  // for IE5+
            document.onmousedown = norightclick;  // for all others
} 
//--- 系统鼠标右键 ---
var isCtrl = code => code === 'ControlLeft' || code === 'ControlRight';

function Frame() {
  Component.apply(this, arguments);

  this.state = {
    dynamicView: { height: null, width: null },
    draggedLinkId: null,
    dragging: false,
    dragMoved: false,
    offset: { x: 0, y: 0 },
    pointer: null,
    scroll: { x: 0, y: 0 },
    showSelector: false,
    selectedItems: [],
    //事件被摧毁
    // isDestroyed: false,
    ctrlPressed: false
  };
}

inherits(Frame, Component);

function componentDidMount() {
  var _props = this.props,
      createInputPin = _props.createInputPin,
      createOutputPin = _props.createOutputPin,
      deleteInputPin = _props.deleteInputPin,
      deleteOutputPin = _props.deleteOutputPin,
      dragItems = _props.dragItems,
      //旋转事件
      onNodeInversed = _props.onNodeInversed,
        //ctrl按键keyup事件
      onMultiChoice  = _props.onMultiChoice,
      isDestoryed = _props.isDestoryed,
      view = _props.view;
  //解决document事件被不断添加
  this.props.canvas.frame = this; 

  var setState = this.setState.bind(this);

  var container = ReactDOM.findDOMNode(this).parentNode;

  var keydown = event => {
    var code = event.code;
    
    var endDragging = this.props.endDragging;
    var _state = this.state,
        dragMoved = _state.dragMoved,
        selectedItems = _state.selectedItems,
        // isDestroyed = _state.isDestroyed,
        ctrlPressed = _state.ctrlPressed;
  
    if (isCtrl(code)) {
      setState({ ctrlPressed: true });
    }

    if (code === 'Escape') {
      setState({ selectedItems: [] });
    }
     //旋转
    if (event.keyCode == 16) {
        if(selectedItems.length == 1){
          var nodeId = selectedItems[0];
          if(typeof(view.node[nodeId]) != 'undefined'){
             view.node[nodeId].isInverse = !view.node[nodeId].isInverse;
          }
          //旋转事件
          onNodeInversed(nodeId,view.node[nodeId]);
        }
    }
    
    var selectedNodes = Object.keys(view.node).filter(id => selectedItems.indexOf(id) > -1);

    if (selectedNodes.length > 0 && code.substring(0, 5) === 'Arrow') {
      var draggingDelta = { x: 0, y: 0 };
      var unit = ctrlPressed ? 1 : 10;

      if (code === 'ArrowLeft') draggingDelta.x = -unit;
      if (code === 'ArrowRight') draggingDelta.x = unit;
      if (code === 'ArrowUp') draggingDelta.y = -unit;
      if (code === 'ArrowDown') draggingDelta.y = unit;

      dragItems(draggingDelta, selectedNodes);

      if (!dragMoved) {
        setState({ dragMoved: true });
      }

      if (!ctrlPressed) {
        endDragging(selectedNodes);

        setState({
          dragMoved: false,
          dragging: false
        });
      }
    }

    if (code === 'KeyI') {
      selectedItems.forEach(id => {
        if (view.node[id] && view.node[id].ins) {
          if (ctrlPressed) {
            deleteInputPin(id);
          } else {
            createInputPin(id);
          }
        }
      });
    }

    if (code === 'KeyO') {
      selectedItems.forEach(id => {
        if (view.node[id] && view.node[id].outs) {
          if (ctrlPressed) {
            deleteOutputPin(id);
          } else {
            createOutputPin(id);
          }
        }
      });
    }

    this.forceUpdate();
  };

  var keyup =  event => {   
    var code = event.code;
    
    var endDragging = this.props.endDragging;
    var _state2 = this.state,
        dragMoved = _state2.dragMoved,
        selectedItems = _state2.selectedItems;

    var selectedNodes = Object.keys(view.node).filter(id => selectedItems.indexOf(id) > -1);
    
    if (isCtrl(code)) {
      setState({ ctrlPressed: false });
      //ctrl按键keyup事件
      onMultiChoice(selectedItems);
      if (dragMoved && selectedNodes) {
        endDragging(selectedNodes);

        setState({
          dragging: false,
          dragMoved: false
        });
      }
    }
  }
  var scroll =  () => {``
    setState({ scroll: {
        x: window.scrollX,
        y: window.scrollY
      } });
  };
  var resize =  () => {
    var rect = container.getBoundingClientRect();

    setState({ dynamicView: {
        height: rect.height,
        width: rect.width
      } });
  };
  document.addEventListener('keydown',keydown);
  document.addEventListener('keyup',keyup);
  window.addEventListener('scroll',scroll);
  window.addEventListener('resize',resize);
  //解决document事件不断添加，解绑需要原处理函数
  this.props.canvas.keyup = keyup;
  this.props.canvas.keydown = keydown;
  this.props.canvas.scroll = scroll;
  this.props.canvas.resize = resize;

  var offset = {
    x: container.offsetLeft,
    y: container.offsetTop
  };

  var scroll = {
    x: window.scrollX,
    y: window.scrollY
  };

  setState({ offset: offset, scroll: scroll });
}

Frame.prototype.componentDidMount = componentDidMount;

function render() {
  var _props2 = this.props,
      createInputPin = _props2.createInputPin,
      createLink = _props2.createLink,
      createNode = _props2.createNode,
      createOutputPin = _props2.createOutputPin,
      deleteInputPin = _props2.deleteInputPin,
      deleteLink = _props2.deleteLink,
      deleteNode = _props2.deleteNode,
      deleteOutputPin = _props2.deleteOutputPin,
      dragItems = _props2.dragItems,
      endDragging = _props2.endDragging,
      fontSize = _props2.fontSize,
      item = _props2.item,
      model = _props2.model,
      selectLink = _props2.selectLink,
      selectNode = _props2.selectNode,
      theme = _props2.theme,
        //修改
      onNodeDoubleClick=_props2.onNodeDoubleClick,
      //chips被选中
      onChipSelected = _props2.onChipSelected,
      //旋转事件
      onNodeInversed = _props2.onNodeInversed,
      //ctrl按键的keyup事件
      onctrlKeyup = _props2.onctrlKeyup,
      updateLink = _props2.updateLink,
      isDestoryed = _props2.isDestoryed,
      view = _props2.view;
   
  var _state3 = this.state,
      draggedLinkId = _state3.draggedLinkId,
      pointer = _state3.pointer,
      dynamicView = _state3.dynamicView,
      selectedItems = _state3.selectedItems,
      //ctrl键选中
      ctrlPressed = _state3.ctrlPressed,
      showSelector = _state3.showSelector;
    

  var frameBorder = theme.frameBorder,
      fontFamily = theme.fontFamily,
      lineWidth = theme.lineWidth,
      nodeBodyHeight = theme.nodeBodyHeight,
      pinSize = theme.pinSize;


  var height = dynamicView.height || view.height;
  var width = dynamicView.width || view.width;

  var border = 1;
  height = height - 2 * border;
  width = width - 2 * border;

  var typeOfNode = item.util.typeOfNode;

  var Link = item.link.DefaultLink;

  var setState = this.setState.bind(this);

  var coordinatesOfLink = link => {
    var from = link.from;
      var to = link.to;

      var x1 = null;
      var y1 = null;
      var x2 = null;
      var y2 = null;

      var nodeIds = Object.keys(view.node);
      var idEquals = function (x) {
        return function (id) {
          return id === x[0];
        };
      };
      var sourceId = from ? nodeIds.find(idEquals(from)) : null;
      var targetId = to ? nodeIds.find(idEquals(to)) : null;

      var computedWidth = null;
       //旋转
      if (sourceId) {
        var source = view.node[sourceId];

        var isInverse = source.isInverse;
        
        var chips = null;

        var BodyHeightWithChips; 

        var computedHeight = 20;
     
		    //类型画图,创建chips
        if(typeof(source.nodeProp) == 'undefined' && source.nodeProp == null
              ||  typeof(source.nodeProp.chips) == 'undefined' || source.nodeProp.chips == null
              || source.nodeProp.chips.length == 0  ){
                //修改node高度
                computedHeight = 6;
        }else{
                computedHeight = 60;
        }
        if (no(source.outs)) source.outs = {};
        // console.log(computedHeight);
        computedWidth = computeNodeWidth({
          bodyHeight: 20,
          pinSize: pinSize,
          fontSize: fontSize,
          node: source
        });
       
        if(isInverse){
            //点突出
            y1 = source.y + xOfPin(pinSize, computedWidth, source.outs.length, from[1]);
            x1 = source.x + pinSize + computedHeight + pinSize;
        }else{
            x1 = source.x + xOfPin(pinSize, computedWidth, source.outs.length, from[1]);
            y1 = source.y + pinSize + computedHeight + pinSize;
        }
      }

      if (targetId) {
        var target = view.node[targetId];

        var isInverse = target.isInverse;

        if (no(target.ins)) target.ins = {};

        computedWidth = computeNodeWidth({
          bodyHeight: nodeBodyHeight,
          pinSize: pinSize,
          fontSize: fontSize,
          node: target
        });
        // console.log(computedWidth);
        if(isInverse){
            //点突出
            y2 = target.y + xOfPin(pinSize, computedWidth, target.ins.length, to[1]);
            x2 = target.x - pinSize;
        }else{
            x2 = target.x + xOfPin(pinSize, computedWidth, target.ins.length, to[1]);
            y2 = target.y - pinSize;
        }
      } else {
        x2 = pointer ? pointer.x - pinSize / 2 : x1;
        y2 = pointer ? pointer.y - pinSize : y1;
      }

      return { x1: x1, y1: y1, x2: x2, y2: y2 };
  };

  var getCoordinates = e => {
    var _state4 = this.state,
        offset = _state4.offset,
        scroll = _state4.scroll;


    return {
      x: e.clientX - offset.x + scroll.x,
      y: e.clientY - offset.y + scroll.y
    };
  };

  var onClick = e => {
    e.preventDefault();
    e.stopPropagation();

    setState({ showSelector: false });
  };

  var onCreateLink = link => {
    var draggedLinkId = createLink(link);

    setState({ draggedLinkId: draggedLinkId });
  };

  var onUpdateLink = (id, link) => {
    updateLink(id, link);

    var disconnectingLink = link.to === null;

    if (disconnectingLink) {
      link.id = id;

      setState({ draggedLinkId: id });
    } else {
      setState({ draggedLinkId: null });
    }
  };

  var onDoubleClick = e => {
    e.preventDefault();
    e.stopPropagation();
    //修改
    // setState({
    //   pointer: getCoordinates(e),
    //   showSelector: true
    // });
  };

  var onMouseDown = e => {
    e.preventDefault();
    e.stopPropagation();
    // console.log(ctrlPressed);
    //多选线
    //  setState({
    //     selectedItems: []
    //   });
      // console.log("取消选择");
    //当没按住ctrl键时按右键取消
    if(e.button == 2){
     //chips被选中
     if(!ctrlPressed){
        setState({
          selectedItems: []
        });
        var once = false;
        var nodes = view.node;
        var nodeIds = Object.keys(view.node);
        nodeIds.map(function(id,index,arr){
          // console.log(nodes[id]);
          if(typeof(nodes[id].nodeProp) == 'undefined' || nodes[id].nodeProp == null){
            return;
          }
          // console.log(nodes[id].nodeProp);
          if(typeof(nodes[id].nodeProp.chips) == 'undefined' || nodes[id].nodeProp.chips == null){
            return;
          }
          var chips = nodes[id].nodeProp.chips;
          for(var i = 0;i < chips.length;i++){
              if(typeof(chips)){
                if(chips[i]['selected'] && !once){
                  once = true;
                }
                chips[i]['selected'] = false;
            }
          }
        });
     }
      
      //修改右键
      if(once || selectedItems.length > 0){
          forbidRight();
      }else{
          enableRight();
      }
      // //线多选
      // setState({
      //   selectedItems: []
      // });
    }
  
  };

  var onMouseLeave = e => {
    e.preventDefault();
    e.stopPropagation();

    var draggedLinkId = this.state.draggedLinkId;
    if (draggedLinkId) delete view.link[draggedLinkId];

    setState({
      dragging: false,
      draggedLinkId: null,
      pointer: null,
      showSelector: false
    });
  };

  var onMouseMove = e => {
    e.preventDefault();
    e.stopPropagation();

    var _state5 = this.state,
        dragging = _state5.dragging,
        dragMoved = _state5.dragMoved,
        selectedItems = _state5.selectedItems;


    var nextPointer = getCoordinates(e);

    setState({
      pointer: nextPointer
    });

    if (dragging && selectedItems.length > 0) {
      var draggingDelta = {
        x: pointer ? nextPointer.x - pointer.x : 0,
        y: pointer ? nextPointer.y - pointer.y : 0
      };

      dragItems(draggingDelta, selectedItems);

      if (!dragMoved) {
        setState({ dragMoved: true });
      }
    }
  };

  var onMouseUp = e => {
    e.preventDefault();
    e.stopPropagation();

    var _state6 = this.state,
        draggedLinkId = _state6.draggedLinkId,
        dragMoved = _state6.dragMoved,
        selectedItems = _state6.selectedItems;


    if (draggedLinkId) {
      delete view.link[draggedLinkId];

      setState({
        draggedLinkId: null,
        pointer: null
      });
    } else {
      var selectedNodes = Object.keys(view.node).filter(id => selectedItems.indexOf(id) > -1);

      if (dragMoved) {
        endDragging(selectedNodes);

        setState({
          dragging: false,
          dragMoved: false,
          pointer: null
        });
      } else {
        setState({
          dragging: false,
          pointer: null
        });
      }
    }
  };

  var selectedFirst = (a, b) => {
    var aIsSelected = selectedItems.indexOf(a) > -1;
    var bIsSelected = selectedItems.indexOf(b) > -1;

    if (aIsSelected && bIsSelected) return 0;

    if (aIsSelected) return 1;
    if (bIsSelected) return -1;
  };

  var selectItem = id => e => {
    e.preventDefault();
    e.stopPropagation();
    // console.log("选中");
    var _state7 = this.state,
        draggedLinkId = _state7.draggedLinkId,
        ctrlPressed = _state7.ctrlPressed;
      //当没有按住ctrl键时取消其它所有选中的chips
    if(!ctrlPressed){
        //取消chip选中
        var nodes = view.node;
        var nodeIds = Object.keys(view.node);
        nodeIds.map(function(id,index,arr){
        // console.log(nodes[id]);
          if(typeof(nodes[id].nodeProp) == 'undefined' || nodes[id].nodeProp == null){
            return;
          }
          // console.log(nodes[id].nodeProp);
          if(typeof(nodes[id].nodeProp.chips) == 'undefined' || nodes[id].nodeProp.chips == null){
            return;
          }
          var chips = nodes[id].nodeProp.chips;
          for(var i = 0;i < chips.length;i++){
                chips[i]['selected'] = false;
          }
      });
    }
 

    if (draggedLinkId) {
      delete view.link[draggedLinkId];

      setState({ draggedLinkId: null });

      return;
    }

    var selectedItems = this.state.selectedItems.slice(0);

    var index = selectedItems.indexOf(id);

    var itemAlreadySelected = index > -1;

    var nodes = view.node;
    //当在多选状态时(即ctrl按键按下)，如果node里有chip被选中，那么该节点不会被取消选中
    var hasSelectedChip = false;
    if (ctrlPressed) {
      if (itemAlreadySelected) {
        if(typeof(nodes[id]) != 'undefined' && typeof(nodes[id].nodeProp) != 'undefined' 
          && nodes[id].nodeProp != null){
            if(typeof(nodes[id].nodeProp.chips) != 'undefined' && nodes[id].nodeProp.chips != null){
              var chips = nodes[id].nodeProp.chips;
              for(var j = 0;j < chips.length;j++){
                if(chips[j]['selected']){
                  hasSelectedChip = true;
                }
              }
        }
        }
        if(!hasSelectedChip){
            selectedItems.splice(index, 1);
        }
      } else {
         //线不能多选
        // if (Object.keys(view.link).indexOf(id) > -1){
        //   selectedItems = [id];
        // }else{
        //   selectedItems.push(id);
        // }
        selectedItems.push(id);
      }
    } else {
      if (!itemAlreadySelected) {       
        selectedItems = [id];
      }
    }

    if (!itemAlreadySelected) {
      if (Object.keys(view.node).indexOf(id) > -1) {
        selectNode(id);
      }

      if (Object.keys(view.link).indexOf(id) > -1) {
        selectLink(id);
      }
    }

    setState({
      dragging: true,
      selectedItems: selectedItems
    });
  };
    //加入选中数组
  var addSelectedItem = nodeId => {
    // console.log("加入选中数组");
     var _state7 = this.state,
        draggedLinkId = _state7.draggedLinkId,
        ctrlPressed = _state7.ctrlPressed;

    var selectedItems = this.state.selectedItems.slice(0);

    var index = selectedItems.indexOf(nodeId);

    var itemAlreadySelected = index > -1;
      //当没有按住ctrl键取消所有chip选择
    if(!ctrlPressed){
        //选中点击的chip所在的node
         if (!itemAlreadySelected) {
           //因为这个时候不是连选状态，所以每次只有一个node被选中
           selectedItems = [];
           selectedItems.push(nodeId);
          if (Object.keys(view.node).indexOf(nodeId) > -1) {
            selectNode(nodeId);
          }
        }
     
        //取消chip选中
        var nodes = view.node;
        var nodeIds = Object.keys(view.node);
        nodeIds.map(function(id,index,arr){
        // console.log(nodes[id]);
          if(typeof(nodes[id].nodeProp) == 'undefined' || nodes[id].nodeProp == null){
            return;
          }
          // console.log(nodes[id].nodeProp);
          if(typeof(nodes[id].nodeProp.chips) == 'undefined' || nodes[id].nodeProp.chips == null){
            return;
          }
          var chips = nodes[id].nodeProp.chips;
          for(var i = 0;i < chips.length;i++){
                chips[i]['selected'] = false;
          }
      });
    }else{
      //连选状态，能够多选
      if (!itemAlreadySelected) {
        selectedItems.push(nodeId);
        if (Object.keys(view.node).indexOf(nodeId) > -1) {
          selectNode(nodeId);
        }
    }
    }

    setState({
      dragging: true,
      selectedItems: selectedItems
    });
    
    }
  //---加入选中数组---
  var startDraggingLinkTarget = id => {
    var from = view.link[id].from;

    deleteLink(id);

    var draggedLinkId = createLink({ from: from });
    setState({ draggedLinkId: draggedLinkId });
  };

  return React.createElement(
    'svg',
    {
      fontFamily: fontFamily,
      fontSize: fontSize,
      height: height,
      onClick: onClick,
      onDoubleClick: onDoubleClick,
      onMouseDown: onMouseDown,
      onMouseEnter: ignoreEvent,
      onMouseLeave: onMouseLeave,
      onMouseMove: onMouseMove,
      onMouseUp: onMouseUp,
      textAnchor: 'start',
      style: { border: frameBorder },
      width: width
    },
    Object.keys(view.node).sort(selectedFirst).map((id, i) => {
      var node = view.node[id];

      var height = node.height,
          ins = node.ins,
          outs = node.outs,
          text = node.text,
          width = node.width,
          x = node.x,
          //属性
          nodeProp = node.nodeProp,
          //旋转
          isInverse = node.isInverse,
          y = node.y;


      var nodeType = typeOfNode(node);
      var Node = item.node[nodeType];

      return React.createElement(Node, { key: i,
        createInputPin: createInputPin,
        createOutputPin: createOutputPin,
        draggedLinkId: draggedLinkId,
        deleteInputPin: deleteInputPin,
        deleteNode: deleteNode,
        deleteOutputPin: deleteOutputPin,
        //修改
        onNodeDoubleClick:onNodeDoubleClick,
        //属性
        nodeProp: nodeProp,
        //旋转
        isInverse:isInverse,
        //chips被选中
        onChipSelected:onChipSelected,
        //ctrl按下
        ctrlPressed:ctrlPressed,
        //加入选中数组
        addSelectedItem:addSelectedItem,
        fontSize: fontSize,
        height: height,
        id: id,
        ins: ins,
        model: model,
        multiSelection: selectedItems.length > 1,
        onCreateLink: onCreateLink,
        outs: outs,
        pinSize: pinSize,
        selected: selectedItems.indexOf(id) > -1,
        selectNode: selectItem(id),
        text: text,
        updateLink: onUpdateLink,
        width: width,
        x: x,
        y: y
      });
    }),
    Object.keys(view.link).map((id, i) => {
      var _view$link$id = view.link[id],
          from = _view$link$id.from,
          to = _view$link$id.to;


      var coord = coordinatesOfLink(view.link[id]);
      var sourceSelected = from ? selectedItems.indexOf(from[0]) > -1 : false;
      var targetSelected = to ? selectedItems.indexOf(to[0]) > -1 : false;

      return React.createElement(Link, { key: i,
        deleteLink: deleteLink,
        from: from,
        lineWidth: lineWidth,
        id: id,
        onCreateLink: onCreateLink,
        startDraggingLinkTarget: startDraggingLinkTarget,
        pinSize: pinSize,
        selected: selectedItems.indexOf(id) > -1,
        selectLink: selectItem(id),
        sourceSelected: sourceSelected,
        targetSelected: targetSelected,
        to: to,
        x1: coord.x1,
        y1: coord.y1,
        x2: coord.x2,
        y2: coord.y2
      });
    }),
    React.createElement(Selector, {
      createNode: node => {
        var id = createNode(node);

        setState({
          selectedItems: [id],
          showSelector: false
        });
      },
      nodeList: item.nodeList,
      pointer: pointer,
      show: showSelector
    })
  );
}

Frame.prototype.render = render;

Frame.propTypes = {
  createInputPin: PropTypes.func.isRequired,
  createOutputPin: PropTypes.func.isRequired,
  createLink: PropTypes.func.isRequired,
  createNode: PropTypes.func.isRequired,
  deleteLink: PropTypes.func.isRequired,
  deleteInputPin: PropTypes.func.isRequired,
  deleteNode: PropTypes.func.isRequired,
  deleteOutputPin: PropTypes.func.isRequired,
  dragItems: PropTypes.func.isRequired,
  endDragging: PropTypes.func.isRequired,
  fontSize: PropTypes.number.isRequired,
  item: PropTypes.shape({
    link: PropTypes.object.isRequired,
    node: PropTypes.object.isRequired,
    nodeList: PropTypes.array.isRequired,
    util: PropTypes.shape({
      typeOfNode: PropTypes.func.isRequired
    })
  }).isRequired,
  selectLink: PropTypes.func.isRequired,
  selectNode: PropTypes.func.isRequired,
    //修改
  onNodeDoubleClick:PropTypes.func.isRequired,
  //chips被选中
  onChipSelected:PropTypes.func.isRequired,
  //旋转事件
  onNodeInversed:PropTypes.func.isRequired,
  //ctrl 按键keyup事件
  onMultiChoice:PropTypes.func.isRequired,
  canvas:PropTypes.object,
  isDestoryed:PropTypes.bool,
  theme: theme.propTypes,
  updateLink: PropTypes.func.isRequired,
  view: PropTypes.shape({
    height: PropTypes.number.isRequired,
    link: PropTypes.object.isRequired,
    node: PropTypes.object.isRequired,
    width: PropTypes.number.isRequired
  }).isRequired
};

Frame.defaultProps = {
  createLink: Function.prototype,
  createNode: Function.prototype,
  createInputPin: Function.prototype,
  createOutputPin: Function.prototype,
  deleteInputPin: Function.prototype,
  deleteLink: Function.prototype,
  deleteNode: Function.prototype,
  deleteOutputPin: Function.prototype,
  dragItems: Function.prototype,
  endDragging: Function.prototype,
  //改字体
  fontSize: 10,
  item: {
    link: { DefaultLink: DefaultLink },
    node: { DefaultNode: DefaultNode },
    nodeList: [],
    util: {
      typeOfNode: function (node) {
        return 'DefaultNode';
      }
    }
  },
  theme: theme.defaultProps,
  selectLink: Function.prototype,
  //修改
  onNodeDoubleClick:Function.prototype,
  //旋转事件
  onNodeInversed:Function.prototype,
  //chips被选中
  onChipSelected:Function.prototype,
  //ctrl 按键keyup事件
  onMultiChoice:Function.prototype,
  canvas:null,
  isDestoryed: false,
  selectNode: Function.prototype,
  updateLink: Function.prototype,
  view: {
    link: {},
    node: {}
  }
};

module.exports = exports.default = Frame;