var Canvas = require('flow-view').Canvas
var view = {
  height:500,
  width:1000,
  node: {
    a: {
      x: 80,
      y: 100,
	  isInverse: true,
	  nodeProp:{chips:[{name:'adc-ee'},{name:"hk"},{name:"taiwan"},{name:"jack"}]},
      text: 'one',
      outs: ['out1', 'out2', 'out3']
    },
    b: {
      x: 180,
      y: 200,
      text: 'two',
      nodeProp:{chips:[{name:'LLL863'},{name:"ADC"}]},
      outs: ['out0', { name: 'in1', type: 'bool' },'out1','eout2','out3','out4'],
      ins: ['in0']
    },
	c: {
      x: 300,
      y: 300,
      text: 'three',
      nodeProp:{},
      ins: ['in0','dd'],
      outs: ['return']
    },
   o: {
      x: 400,
      y: 300,
      text: 'four',
      nodeProp:{chips:[{name:'Scope-90099'}]},
      ins: ['dddaa','eeee'],
      outs: ['5688']
    },
  ERBIUM : { 
			"x" : 500, 
			"y" : 200, 
			"nodeProp" : { "type" : "Erb-001-001", "category" : "board", chips : [ { "name" : "a" } ] }, 
			"text" : "a", 
			"outs" : [ "out" ] 
		}
  },
  
  
  link: {
    l: {
      from: ['a', 0],
      to: ['b', 1]
    },
    pp: {
      from: ['b', 0],
      to: ['c', 0]
    },
     pp1: {
      from: ['b', 1],
      to: ['o', 1]
    },
     opi: {
      from: ['o', 1],
      to: ['c', 1]
    }

  }
}

var canvas = new Canvas('drawing')

canvas.on('onNodeDoubleClick', (nodeId,node) => {
  console.log("onNodeDoubleClick");
  console.log(nodeId);
  console.log(node);
});
//选中chip时的事件
canvas.on('onChipSelected',(chip,node) =>{
  console.log("onChipSelected")
  console.log(chip);
  console.log(node);
});
//选中节点，按shift旋转
canvas.on('onNodeInversed',(nodeId,node) =>{
  console.log("onNodeInversed");
  console.log(nodeId);
  console.log(node);
})

canvas.on('createLink', (link, id) => {
  console.log('createLink', link, id)
})

canvas.on('createNode', (node, nodeId) => {
  console.log('createNode', node, nodeId)
})

canvas.on('createInputPin', (nodeId, position, pin) => {
  console.log('createInputPin', nodeId, position, pin)
})

canvas.on('createOutputPin', (nodeId, position, pin) => {
  console.log('createOutputPin', nodeId, position, pin)
})

canvas.on('deleteLink', (linkId) => {
  console.log('deleteLink', linkId)
})

canvas.on('deleteNode', (nodeId) => {
  console.log('deleteNode', nodeId)
})

canvas.on('deleteInputPin', (nodeId, position, pin) => {
  console.log('deleteInputPin', nodeId, position, pin)
})

canvas.on('deleteOutputPin', (nodeId, position) => {
  console.log('deleteOutputPin', nodeId, position)
})

canvas.on('endDragging', (selectNodes) => {
  console.log('endDragging', selectNodes)
})

canvas.on('renameNode', (nodeId, text) => {
  console.log('renameNode', nodeId, text)
})

canvas.on('selectLink', (id) => {
  console.log('selectLink', id)
})

canvas.on('selectNode', (id) => {
  console.log('selectNode', id)
})
//按住ctrl键可以多选
canvas.on('onMultiChoice',(selectedNodeNames,selectedNodes) =>{
  console.log('onMultiChoice');
  console.log(selectedNodeNames);
  console.log(selectedNodes);
});

canvas.render(view);







