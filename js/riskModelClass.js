import {get_source_node_names} from "./utils.js";
import {exp} from "./allowed_functions.js";
import {unif, norm} from "./distributions.js";

export default class riskModelClass {
    constructor () {
        this.nodes    = new Map();
        this.edges    = new Map();
        this.result   = new Map();
        this._visited = new Map();
        this.mc_iter  = 100000;
    }
    add_node (node_name, node_expr) {
        // get source node names
        const source_node_names = get_source_node_names(node_expr);
        // build eval_code
        const eval_code = this._build_eval_code(
            node_expr,
            source_node_names
        );
        // add new node
        this.nodes.set(
            node_name, 
            { display_code: node_expr, 
              eval_code: eval_code }
        );
        // add implicit nodes, if necessary
        this._add_implicit_nodes(source_node_names);
        // update edge list
        this._update_edges();
    }
    _build_eval_code (node_expr, source_node_names) {
        const args = source_node_names.toString();
        // example: '(function({a,b,c}) { return exp(a+b)/c; })(theList);'
        const eval_code = '(function({'+args+'}) { return '+node_expr+'; })(input_args)';
        return eval_code;
    } 
    _add_implicit_nodes (source_node_names) {
        for (let this_source_node of source_node_names) {
            if ( !this.nodes.has(this_source_node) ) {
                this.nodes.set(this_source_node, {display_code: "--"});
            }
        }
    }
    _update_edges () {
        // delete old edge map
        this.edges.clear();
        // build new edge map
        for (let [node_name, node_content] of this.nodes) {
            // get source nodes
            let source_nodes = get_source_node_names( node_content.display_code );
            // set new edges
            this.edges.set(node_name, source_nodes)
        }
    }
    get_vis_network_data () {
        // get nodes
        let node_array = [];
        for (let node_name of this.nodes.keys()) {
            node_array.push({id: node_name, label: node_name});
        }
        let nodes = new vis.DataSet(node_array);
        // get edges
        let edges_array = [];
        for (let [node_name, source_nodes] of this.edges) {
            for (let this_source_node of source_nodes) {
                edges_array.push({from: node_name, to: this_source_node});
            }
        }
        let edges = new vis.DataSet(edges_array);

        return { nodes: nodes, edges: edges }
    }
    get_results (node_names_only = false) {
        let result;
        if (node_names_only) {
            result = [];
            for (let [node_name, node_content] of this.nodes) {
                result.push(node_name);
            }
        } else {
            result = {};
            for (let [node_name, node_content] of this.nodes) {
                result[node_name] = node_content;
            }
        }
        return result;
    }
    get_node_result (node_name) {
        let result;
        if (this.result.has(node_name)) {
            result = this.result.get(node_name);
        } else {
            result = [];
        }
        return result;
    }
    get_df_nodes () {
        // get data
        let data = [];
        for (let [node_name, node_content] of this.nodes) {
            data.push([node_name, node_content.display_code]);
        }
        // build df_nodes
        const df_nodes = {
            header: ["node name", "node expr"],
            data: data
        };
        // return df_nodes
        return df_nodes;
    }
    get_end_nodes () {
        // end nodes have no edges (arrows) pointing away from them,
        // only edges (arrows) pointing to them
        // i.e. they are not source nodes for other nodes
        // In the edge list, they do not appear as an entry

        // get names of source nodes in edge list
        let nodes_in_edge_list = [];
        for (let source_nodes of this.edges.values()) {
            nodes_in_edge_list = nodes_in_edge_list.concat(source_nodes);
        }
        // remove duplicates
        nodes_in_edge_list = [...new Set(nodes_in_edge_list)];
        // get names of nodes from node list
        let nodes_in_node_list = Array.from(this.nodes.keys());
        // nodes that are in node list, but not in edge list, are end nodes
        const diff = nodes_in_node_list.filter(x => !nodes_in_edge_list.includes(x));
        // return result
        return diff;
    }
    run_simulation () {
        // prepare result list
        this.result.clear();
        this._visited.clear();
        for (let node_name of this.nodes.keys()) {
            this.result.set(node_name, []);
            this._visited.set(node_name, false);
            //this.result.set(node_name, {visited: false, result: []})
        }

        // evaluate graph, starting at end node
        for (let end_node of this.get_end_nodes()) {
            this._evaluate_model(end_node);
        }
    }
    _evaluate_model (target_node) {
        if ( !this._visited.get(target_node) ) {
            // set this node as visted
            this._visited.set(target_node, true);
            // go over source nodes of this target node
            const source_result_scalar = {};
            const source_result_vector = {}
            for (let source_node of this.edges.get(target_node)) {
                this._evaluate_model(source_node)
                if (this.result.get(source_node).length === 1) {
                    source_result_scalar[source_node] = this.result.get(source_node);
                } else {
                    source_result_vector[source_node] = this.result.get(source_node);
                }
            }
            // evaluate eval_code of the target_node
            // pseudo vectorized
            let result = Array(this.mc_iter);
            let input_args, tmp;
            for (let i = 0; i < this.mc_iter; ++i) {
                //
                tmp = {};
                for (const key in source_result_vector) {
                    tmp[key] = source_result_vector[key][i];
                }
                // create input_args dict which is the input for the function in eval_code
                input_args = { ...source_result_scalar, ...tmp};
                //
                result[i] = eval(this.nodes.get(target_node).eval_code);
            }
            // add result to result of this node
            this.result.set(target_node, result);
        }
    }
}