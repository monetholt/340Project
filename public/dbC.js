
document.getElementById("addCityButton").addEventListener("click", function (event) {

    var form = document.getElementById("addCity");
    var name = form.elements.Name.value;
    var state = form.elements.State.value;

    var req = new XMLHttpRequest();

    var queryString = `/insertCity?Name=${name}&State=${state}`
    console.log(queryString);

    req.open("GET", queryString, true);

    req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');


    req.addEventListener('load', function () {

        if (req.status >= 200 && req.status < 400) {
            $('#addForm').modal('hide');


            //Response and id from server
            var response = JSON.parse(req.responseText);
            var id = response.inserted;

            //Get the lower table on City page
            var table = document.getElementById("cityTable");

            var row = table.insertRow(-1);

            //Populates table based on user submitted values for each field in the form
            var name = document.createElement('td');
            name.textContent = addCity.elements.Name.value;
            row.appendChild(name);

            var state = document.createElement('td');
            state.textContent = addCity.elements.State[addCity.elements.State.selectedIndex].text;
            row.appendChild(state);

            //Adds Update button to table
            var updateData = document.createElement('td');
            updateData.className = "actionCell";

            var updateDataLink = document.createElement('a');
            updateDataLink.setAttribute('href', '/updateCity?id=' + id);

            var updateButton = document.createElement('input');
            updateButton.setAttribute('value', 'Update');
            updateButton.setAttribute('type', 'button');
            updateButton.className = "btn btn-sm btn-primary";


            updateDataLink.appendChild(updateButton);

            updateData.appendChild(updateDataLink);

            row.appendChild(updateData);

            //Adds Delete button to table
            var deleteCell = document.createElement('td');
            deleteCell.className = "actionCell";

            var deleteButton = document.createElement('input');
            deleteButton.setAttribute('type', 'button');
            deleteButton.setAttribute('name', 'delete');
            deleteButton.setAttribute('value', 'Delete');
            deleteButton.setAttribute('onClick', 'deleteData("dataTable",' + id + ')');
            deleteButton.className = "btn btn-sm btn-secondary";

            var deleteHidden = document.createElement('input');
            deleteHidden.setAttribute('type', 'hidden');
            deleteHidden.setAttribute('id', 'delete' + id);

            deleteCell.appendChild(deleteButton);
            deleteCell.appendChild(deleteHidden);

            row.appendChild(deleteCell);

        } else {

            console.log("error");
        }
    });
    req.send(queryString);
    event.preventDefault();
});



function deleteData(tableId, id){                               
    var deleteItem = "delete" + id;                             	
	var table = document.getElementById("exerciseTable");       
	var numRows = table.rows.length;

	
	for(var i = 1; i < numRows; i++){                          
		var row = table.rows[i];
		var findData = row.getElementsByTagName("td");		  
		var erase = findData[findData.length -1];		        
		if(erase.children[1].id === deleteItem){              
			table.deleteRow(i);
		}

	}

	var req = new XMLHttpRequest();
	

	req.open("GET", "/delete?id=" + id, true);             

	req.addEventListener("load",function(){
		if(req.status >= 200 && req.status < 400){        
	    	console.log('delete was successful');
		} else {
		    console.log('error');
		}
	});

	req.send("/delete?id=" + id);                          

};



