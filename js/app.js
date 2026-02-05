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
function call_modal_dialog_add_change_node_by_id(i) {
    let result = model.get_node(i-1);
    modal_dialog_add_change_node( result.node_name, result.node_expr );
}

function update_table_and_graph() {
    // get data frame with model infos
    const df_nodes = model.get_df_nodes();
    // create model table
    createTable("model_table", df_nodes.header, df_nodes.data, call_modal_dialog_add_change_node_by_id);
    // view updated network
    network.setData( model.get_vis_network_data() );
}

function modal_dialog_add_change_node (pre_node_name = "", pre_node_value = "") {
    const modal        = document.getElementById("modalAddNewNode");
    const span         = document.getElementsByClassName("close")[0];
    const cancelButton = document.getElementById("cancelButton");
    const acceptButton = document.getElementById("acceptButton");
    const node_name    = document.getElementById("input_node_name");
    const node_expr    = document.getElementById("input_eq");

    // When the user clicks the button and starts this modal dialog, 
    // clear the text field for node_name and node_expr
    node_name.value     = pre_node_name;//"";
    node_expr.value     = pre_node_value;//"";
    // open/show the modal
    modal.style.display = "block";

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
}

window.modal_dialog = modal_dialog_add_change_node;
//--- END SHOW NETWORK AND CREATE MODEL TABLE ----------------------------------

//--- BEGIN RUN SIMULATION -----------------------------------------------------
const select_node_result = document.getElementById('select_node_result');

function update_select_node_result(options) {
    // Clear existing options
    select_node_result.innerHTML = '---';
    options.forEach(option => {
        const opt = document.createElement('option');
        opt.value       = option;
        opt.textContent = option;
        select_node_result.appendChild(opt);
    });
}

//var el_selected_node_result = document.getElementById("select_node_result");

// function for btn_run_simulaition
window.run_simulation = function() {
    // check model
    // ...
    // run simulation
    model.run_simulation();
    // check if simulation run was ok
    // ...
    // update select option of select_node_result
    update_select_node_result(model.get_results(true));
    // Set the selected option to first end node
    const first_end_node_name = model.get_end_nodes()[0];
    //el_selected_node_result.value = first_end_node_name;
    document.getElementById("select_node_result").value = first_end_node_name;
    // plot Histogram for first end node
    plot_result(first_end_node_name);
}

// function for select_node_result
window.selected_node_result = function() {
    //const node_name = el_selected_node_result.value;//
    const node_name = document.getElementById("select_node_result").value;
    console.log(node_name);
    if (node_name !== '---') {
        plot_result(node_name);
    }
}

function plot_result(node_name) {
    const trace = {
        x       : model.get_node_result(node_name),
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
        {title: 'Histogram for '+node_name} // Gives chart layout a title
    );
}
//--- END RUN SIMULATION -------------------------------------------------------

window.openTab = function(event, tabName) {
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

