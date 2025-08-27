// script.js
export function createTable(container, header_names, table_data) {
    // Get the table container
    const tableContainer = document.getElementById(container);
    
    // Clear any existing table
    tableContainer.innerHTML = '';

    // Create a new table element
    const table = document.createElement('table');

    // Create a header row
    const headerRow = document.createElement('tr');
    for (let this_header_name of header_names) {
        // Create a header cell
        const headerCell = document.createElement('th');
        // Add text to the header cell
        headerCell.textContent = this_header_name;
        // Append header cell to the header row
        headerRow.appendChild(headerCell); 
    }
    table.appendChild(headerRow); // Append header row to the table

    // Loop over table_contet to create rows and cells of table
    let row, cell;
    for (let this_row of table_data) {
        // Create a new row
        row = document.createElement('tr'); 

        for (let this_entry of this_row) {
            // Create a new cell
            cell = document.createElement('td'); 
            // Add text to the cell
            cell.textContent = this_entry; 
            // Append cell to the row
            row.appendChild(cell); 
        }
        // Append row to the table
        table.appendChild(row); 
    }

    // Append the table to the container
    tableContainer.appendChild(table);
}
