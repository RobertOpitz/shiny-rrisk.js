import riskModelClass from "./riskModelClass.js";
import { createTable } from "./table.js";

// set up new model instance
var model = new riskModelClass();

// set intial vis network
var network = new vis.Network(
    // container
    document.getElementById("mynetwork"),
    // data
    { nodes: [], edges: [] }, 
    // options
    { edges: { arrows: "from" } }
);

//--- BEGIN SHOW NETWORK AND CREATE MODEL TABLE --------------------------------
function update_table_and_graph() {
    // get data frame with model infos
    const df_nodes = model.get_df_nodes();
    // create model table
    createTable("model_table", df_nodes.header, df_nodes.data);
    // view updated network
    network.setData( model.get_vis_network_data() );
}

function modal_dialog() {
    const modal        = document.getElementById("modalAddNewNode");
    const btn          = document.getElementById("btn_add_new_node");
    const span         = document.getElementsByClassName("close")[0];
    const cancelButton = document.getElementById("cancelButton");
    const acceptButton = document.getElementById("acceptButton");
    const node_name    = document.getElementById("input_node_name");
    const node_expr    = document.getElementById("input_eq");

    // When the user clicks the button, open the modal
    btn.onclick = function() {
        node_name.value = "";
        node_expr.value = "";
        modal.style.display = "block";
    }
    // When the user clicks on <span> (x), close the modal
    span.onclick = function() {
        // remove modal dialog
        modal.style.display = "none";
    }
    // When the user clicks the Cancel button, close the modal
    cancelButton.onclick = function() {
        // remove modal dialog
        modal.style.display = "none";
    }
    // When the user clicks the Accept button, retrieve the name and show an alert
    acceptButton.onclick = function() {
        // add new node to model
        model.add_node(node_name.value, node_expr.value);
        // apdate table and network
        update_table_and_graph();
        // remove modal dialog
        modal.style.display = "none";
    }
    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
}

document.getElementById("btn_add_new_node").onclick = function() {
    modal_dialog();
};
//--- END SHOW NETWORK AND CREATE MODEL TABLE ----------------------------------

//--- BEGIN RUN SIMULATION -----------------------------------------------------
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
//--- END RUN SIMULATION -------------------------------------------------------

    function openTab(event, tabName) {
        // Hide all tabs
        const tabs = document.querySelectorAll('.tab');
        tabs.forEach(tab => {
            tab.classList.remove('active-tab');
        });

        // Remove active class from all buttons
        const buttons = document.querySelectorAll('.tab-button');
        buttons.forEach(button => {
            button.classList.remove('active');
        });

        // Show the current tab and add an active class to the button that opened the tab
        document.getElementById(tabName).classList.add('active-tab');
        event.currentTarget.classList.add('active');
    }


