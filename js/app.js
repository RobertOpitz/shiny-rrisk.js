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

// highlight row of node in node table
network.on(
    "click", 
    function (event) {
        const { nodes } = event; // Extract nodes array from the event
        
        let this_node;
        if (nodes.length) 
            this_node = nodes[0]; // nodes is an array, but we only need only the element
        else
            this_node = ""; // no node selected

        // get position of node in table
        //const i = ...;

        const table = document.getElementById("model_table");
        const rows  = table.getElementsByTagName("tr");

        // Reset all rows to the original color (optional)
        for (let j = 0; j < rows.length; j++) {
            if (rows[j].cells[0].textContent === this_node) {
                rows[j].style.backgroundColor = 'lightblue';       
            } else {
                rows[j].style.backgroundColor = '';
            }
        }
        //rows[i].style.backgroundColor = 'lightblue';
    }
);

// show change dialog if user double clicks on node
network.on(
    "doubleClick", 
    function (event) {
        const { nodes } = event; // Extract nodes array from the event
        if (nodes.length) {
            let result = model.get_node( undefined, nodes[0] );
            modal_dialog_add_change_node( result.node_name, result.node_expr, true );
        }
    }
);

//--- BEGIN SHOW NETWORK AND CREATE MODEL TABLE --------------------------------
function addRowHandlers(table_id) {
    const table = document.getElementById(table_id);
    const rows  = table.getElementsByTagName("tr");

    for (let i = 1; i < rows.length; i++) {
        // single click: highlight row of node in table, and node in graph
        rows[i].addEventListener(
            'click', 
            function() {
                // Reset all rows to the original color (optional)
                for (let j = 0; j < rows.length; j++) {
                    rows[j].style.backgroundColor = '';
                }
                // Change the background color of the clicked row
                rows[i].style.backgroundColor = 'lightblue'; // You can choose any color
                // higlight selected node in graph
                let this_node = model.get_node( i-1, undefined );
                network.selectNodes([this_node.node_name]);
            }
        );
        //double click: show change dialog for selected node
        rows[i].addEventListener(
            'dblclick', 
            function() {
                let this_node = model.get_node( i-1, undefined );
                modal_dialog_add_change_node( this_node.node_name, 
                                              this_node.node_expr, 
                                              true );
            }
        );
    }
}

function update_table_and_graph() {
    // get data frame with model infos
    const df_nodes = model.get_df_nodes();
    // create model table
    createTable( "model_table", df_nodes.header, df_nodes.data );
    // add row handlers
    addRowHandlers( "model_table" );
    // view updated network
    network.setData( model.get_vis_network_data() );
}

function modal_dialog_add_change_node (pre_node_name  = "", 
                                       pre_node_value = "", 
                                       change_node    = false) {
    const modal        = document.getElementById("modalAddNewNode");
    const span         = document.getElementsByClassName("close")[0];
    const modalTitle   = document.getElementById("modalTitle");
    const cancelButton = document.getElementById("cancelButton");
    const acceptButton = document.getElementById("acceptButton");
    const deleteButton = document.getElementById("deleteButton");
    const node_name    = document.getElementById("input_node_name");
    const node_expr    = document.getElementById("input_eq");

    // set the title of the modal, the name of the acceptButton,
    // and if the delete button will be shown or not.
    // If the node is implicit, then show the deleteButton, but disanle it
    if ( change_node ) {
        acceptButton.textContent = "Change node";
        deleteButton.style.display = "block";
        if ( model.is_implicit_node( pre_node_name ) ) {
            modalTitle.textContent = "Change node";
            deleteButton.disabled = true;
        } else {
            modalTitle.textContent = "Change or delete node";
            deleteButton.disabled = false;
        };
    } else {
        modalTitle.textContent = "Add new node";
        acceptButton.textContent = "Add new node";
        deleteButton.style.display = "none";
    }

    // When the user clicks the button and starts this modal dialog, 
    // clear the text field for node_name and node_expr
    node_name.value = pre_node_name;
    node_expr.value = pre_node_value;

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
        let result;
        if ( change_node ) {
            // change existing node
            result = model.change_node(pre_node_name, node_name.value, node_expr.value);
        } else {
            // add new node to model
            result = model.add_node(node_name.value, node_expr.value);
        }
        if ( result.is_ok ) {
            // update table and network
            update_table_and_graph();
            // remove modal dialog
            modal.style.display = "none";
        } else {
            // 
            alert(`Error: ${result.error_message}`);
        }
    }
    // if deleteButton is active then remove this node
    deleteButton.onclick = function() {
        let result = model.remove_node( pre_node_name );
        // update table and network
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

// function for btn_run_simulaition
window.run_simulation = function() {
    // check model
    // ...
    // run simulation
    model.run_simulation();
    // check if simulation run was ok
    // ...
    // update select option of select_node_result
    update_select_node_result( Array.from( model.nodes.keys() ) );
    // Set the selected option to first end node
    const first_end_node_name = model.get_end_nodes()[0];
    document.getElementById("select_node_result").value = first_end_node_name;
    // plot Histogram for first end node
    plot_result(first_end_node_name);
}

// function for select_node_result
window.selected_node_result = function() {
    const node_name = document.getElementById("select_node_result").value;
    if (node_name !== '---') {
        plot_result(node_name);
    }
}

function plot_result(node_name) {

    const result = model.get_node_result(node_name); 

    //---BEGIN: HISTOGRAM------------------------------------------------------
    const histTrace = {
        x        : result,
        type     : 'histogram',
        histnorm : "probability density",
        nbinsx   : 200,
        marker   : {
            color : 'gray', // using color parameter
        },
    };

    Plotly.newPlot(
        'histogramDiv', 
        [histTrace], 
        {title: 'Histogram for ' + node_name} // Gives chart layout a title
    );
    //---END: HISTOGRAM--------------------------------------------------------

    //---BEGIN: ECDF-----------------------------------------------------------
    const num_iter = result.length;
    const ecdf_y = new Array(num_iter); // Initialize an empty array
    // create y-entries for ecdf
    for (let i = 0; i < num_iter; i++) {
        ecdf_y[i] = (i / num_iter);
    }

    const ecdfTrace = {
        x    : result.toSorted(function(a, b){return a - b}),
        y    : ecdf_y,
        type : "line"
    }

    Plotly.newPlot(
        'ecdfDiv', 
        [ecdfTrace], 
        {title: 'ECDF for ' + node_name} // Gives chart layout a title
    );
    //---END: ECDF-------------------------------------------------------------

    //---BEGIN: Convergence----------------------------------------------------
    const convergence_y = new Array(num_iter);
    const convergence_x = new Array(num_iter);

    let sum = 0;
    const num_iter_plus_one = num_iter + 1;
    for (let i = 1; i < num_iter_plus_one; i++) {
        sum += result[i];
        convergence_y[i] = sum / i;
        convergence_x[i] = i;
    }

    const convTrace = {
        x    : convergence_x,
        y    : convergence_y,
        type : "line"
    }

    Plotly.newPlot(
        'convergenceDiv',
        [convTrace],
        {title: 'Convergence for ' + node_name} // Gives chart layout a title
    )
    //---END: Convergence------------------------------------------------------
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

