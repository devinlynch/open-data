
OpenData = function() {
	var that = this;
	this.dataSets = [];
	this.dataSetMap = {};
	$(function() {
		for(var i in that.datasets) {
			var ds = that.datasets[i];
			that.dataSetMap[ds.dataset_id] = ds;
			console.log(ds);
			$('#dataset-dropdown').append('<option value="'+ds.dataset_id+'">'+ds.name+'</option>');
		}
	});
	this.initializeIndex = function(datasets) {
		console.log(datasets);
		that.datasets = datasets;
	}


	var assertionLine = '<div class="assertion"><select class="form-control assertion-input"><option value="one">Select...</option></select><select class="form-control assertion-ass"><option value="0">=</option></select><input placeholder="Value" class="form-control assertion-input-value"><span class="glyphicon glyphicon-plus add-input"></span></div>';

	var currentDsId;
	this.handleDatasetChosen = function(dsId) {
		 currentDsId = dsId;

		var ds = that.dataSetMap[dsId];
		if(!ds)
			return;



		var inputs = ds.dataset_inputs;
		console.log(inputs);
		$('.assertion-input').empty();
		$('.assertion-input').append('<option>Select...</option>');
		for(var i in inputs) {
			var input = inputs[i];
			$('.assertion-input').append('<option value="'+input.dataset_input_id+'">'+input.visual_name+'</option>');
		}
	}

	this.addInput = function() {
		var newLine = $(assertionLine);

		var ds = that.dataSetMap[currentDsId];

		var inputs = ds.dataset_inputs;
		console.log(inputs);
		for(var i in inputs) {
			var input = inputs[i];
			$(newLine).find('.assertion-input').append('<option value="'+input.dataset_input_id+'">'+input.visual_name+'</option>');
		}

		newLine.find('.add-input').on('click', function() {
			openData.addInput();
		});

		$('.add-input').replaceWith('<span class="glyphicon glyphicon-remove remove-row"></span>');

		$('.remove-row').on('click', function() {
			$(this).parent().remove();
		});

		$('.assertions').append(newLine);

		$('.assertion-input').on('change', function() {
			openData.handleChangeInput($(this));
		});
	}

	this.handleChangeInput = function(element) {
		var id = element.val();
		var ds = that.dataSetMap[currentDsId];

		var inp = getDataSetInputById(ds, id);

		var selectAss = element.parent().find('.assertion-ass');
		selectAss.empty();
		selectAss.append('<option value="0">=</option>');
		
		console.log(inp.data_type_id);
		if(inp.data_type_id === 2) {
			selectAss.append('<option value="1"><</option>');
			selectAss.append('<option value="2">></option>');
			selectAss.append('<option value="3">>=</option>');
			selectAss.append('<option value="4"><=</option>');
		}

	}

	this.submit = function(){
		var dataSetId = $('#dataset-dropdown').val();
		if(dataSetId == undefined) {
			return;
		}

		var assertions = [];
		$('.assertion').each(function() {
			var inputId = $(this).find('.assertion-input').val();
			if(inputId === undefined || inputId==="" || inputId.indexOf("Select") != -1)
				return;
			var assertionId = $(this).find('.assertion-ass').val();
			if(assertionId===undefined)
				assertionId=0;
			var value = $(this).find('.assertion-input-value').val();
			if(value === undefined || value.length === 0)
				return;

			var assertion = {
				value: value,
				assertion: assertionId,
				dataset_input_id: inputId
			}
			assertions[assertions.length] = assertion;
		});

		var email = $('.email-input').val();
		if(!email || email.length < 0) {
			return;
		}

		if(assertions.length === 0 ) {
			return;
		}

		var subscribe = {
			email_address: email,
			dataset_id: dataSetId
		}

		$.post( "subscribe", { subscribe: subscribe, assertions: assertions }, function( data ) {
		  if(data.error) {
		  	console.log('error!');
		  	$('.subscribe-submit').after('<p>There was an error, please try again</p>');
		  } else{
		  	console.log('success');
		  	$('#searchDiv').fadeOut();
		  	$('.success').fadeIn();
		  }
		}, "json");

	}

	function getDataSetInputById(ds, id) {
		for(var i in ds.dataset_inputs) {
			var inp = ds.dataset_inputs[i];
			if((''+inp.dataset_input_id) === id)
				return inp;
		}
		return undefined;
	}
};

openData = new OpenData();

$(function() {
	$('#dataset-dropdown').on('change', function() {
		var val = $(this).val();

		if(val === 'one') {
			$('.afterdataset').hide();
		} else{
			$('.afterdataset').show();
		}

		$('.assertion-input-value').val('');

		var i=0;
		$('.assertion').each(function() {
			if(i!==0){
				$(this).remove();
			}
			i++;
		})

		openData.handleDatasetChosen(val);
	});

	$('.add-input').on('click', function() {
		openData.addInput();
	});

	$('.assertion-input').on('change', function() {
		openData.handleChangeInput($(this));
	});

	$('.subscribe-submit').on('click', function() {
		openData.submit();
	});

	$('.backBtn').on('click', function() {
		unconfuse();
	});

	$('#homebtn').on('click', function() {
		window.location = "/";
	});

	$('#licencebtn').on('click', function() {
		window.location = "/licence";
	});
});

function confused(){
	$('#mainDiv').fadeOut(function(){
	  $('#aboutDiv').fadeIn();
	});
}
function unconfuse(){
  $('#aboutDiv').fadeOut(function(){
     $('#mainDiv').fadeIn();
  });
}