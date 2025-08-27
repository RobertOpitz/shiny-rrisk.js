export function get_source_node_names (node_expr) {
    // output object
    let source_node_names = [];

    // remove all white spaces
    const clean_node_expr = node_expr.replace(/\s/g, "")
    
    // set serch regrex
    const alpha = /^[a-zA-Z]/;
    const alphanumeric = /^[a-zA-Z0-9_]/;
    const open_bracket = /^[(]/;
    
    let i = 0;
    const string_length = clean_node_expr.length;
    let start, end, is_function;

    while (i < string_length) {
        // check if leading char is alpha
        if ( alpha.test(clean_node_expr.at(i)) ) {
            // collect chars until they are not alpha numeric
            start = i;
            end   = start;
            is_function = false;
            while (i < string_length) {
                if ( alphanumeric.test(clean_node_expr.at(i)) ) {
                    end = i;
                    i += 1;
                } else {
                    // check if non-alphanumeric char is open bracket
                    if ( open_bracket.test(clean_node_expr.at(i)) ) {
                        is_function = true;
                    }
                    break;
                }
            }
            // if alphanumeric symbol is not a function, then it is a source node
            if (!is_function) {
                source_node_names.push(clean_node_expr.slice(start, end+1));
            }

        } else {
            i += 1;
        }
    }
    
    // remove duplicates from source_node_names
    source_node_names = [...new Set(source_node_names)];

    return source_node_names;
}