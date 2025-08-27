import riskModelClass from "./riskModelClass.js";
import { createTable } from "./table.js";

var model = new riskModelClass();

// set intial vis network
var network = new vis.Network(
    document.getElementById("mynetwork"),//container, 
    { nodes: [], edges: [] },//data, 
    { edges: { arrows: "from" } }//options
);

function show_network() {
    //
    const node_name = document.getElementById("input_node_name").value;
    const node_expr = document.getElementById("input_eq").value;
    //
    model.add_node(node_name, node_expr);
    //console.log(model.nodes);
    console.log(model.get_end_nodes());
    const df_nodes = model.get_df_nodes();
    createTable("model_table", df_nodes.header, df_nodes.data);
    // view updated network
    network.setData( model.get_vis_network_data() );
}

document.getElementById("btn_show_network").onclick = function() {show_network()};

// const myList = {c:0.5,b:2,a:-3}

//function exp(x) {return Math.exp(x);}

// function my_eval(theList) {
//   return eval('(function({a,b,c}) { return exp(a+b)/c; })(theList);');
// }

//function my_eval(dict) {
//  return Function('dict', 'return exp(dict.a+dict.b)/dict.c;')(dict);
//}

//document.getElementById("btn_run_simulation").onclick = function() {console.log(my_eval(myList))};

function eval_func () {
  // run simulation
  model.run_simulation();
  // plot Histogram for first end node
  const trace = {
    x       : model.get_node_result(model.get_end_nodes()[0]),
    type    : 'histogram',
    histnorm: "probability density",
    nbinsx  : 100,
    marker  : {
        color: 'gray', // using color parameter
    },
  };

  Plotly.newPlot(
    'histogramDiv', 
    [trace], 
    {
        title: 'Basic Histogram with Color' // Gives chart layout a title
    }
  );
  //console.log(model.result);
} 

document.getElementById("btn_run_simulation").onclick = eval_func;

// // Histogram for random number generator
// const trace = {
//     x       : model.get_node_result(model.get_end_nodes()),
//     type    : 'histogram',
//     histnorm: "probability density",
//     nbinsx  : 100,
//     marker  : {
//         color: 'gray', // using color parameter
//     },
// };

// Plotly.newPlot(
//     'histogramDiv', 
//     [trace], 
//     {
//         title: 'Basic Histogram with Color' // Gives chart layout a title
//     }
// );


