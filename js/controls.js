		var totalcontrolscount = 0;
		//******Controls ****
		function controls_init()
		{
			var ct = JSON.parse(controls);
			
			jQuery.each(ct.controls, function (k,v){
				var control = ct.controls[k];
				//at this point I could try and store the details of the control inside the item on the "left side" of the screen, but why? When I have those details inside the JSON already...
				//So I will just build a div and call it 
				//control.name + "_" + control.type
				$("#inputcontainer").append('<div id="' + control.id + '_' + control.type + '" class="draggable">' + control.name + '<br style="clear: both"></div>')
			});//end each
		}
		//End ***Controls ***
		
	
		function drag_init() {
		  $('.draggable').draggable({
			cursor: 'move',
			helper: drag_myHelper
		  });
		  
		  $(".droppable").droppable({
			drop: drag_handleDrop
		  });
		 
		}
		 
		function drag_myHelper( event ) {
		
			if(groups<=0){$("#main").html("");group_addGroup();}
			var innerdiv = $(event.currentTarget).clone(false);
			var outerdiv = $('<div style="clear: both"></div>');
			outerdiv.append(innerdiv.css({float:'left'}));
		  return outerdiv.addClass('helper');
		}
	
		function drag_handleDrop( event, ui ) {
		
			totalcontrolscount++;
			var elem = ui.helper.find(".draggable");
			var newDiv;
			switch(elem.attr("id").substr(elem.attr("id").indexOf("_")+1)) {
				case "radiogroup":
					newDiv = controls_buildradiogroup(elem.attr("id").substr(0,elem.attr("id").indexOf("_")));
					break;
				case "checkboxgroup":
					newDiv = controls_buildcheckboxgroup(elem.attr("id").substr(0,elem.attr("id").indexOf("_")));
					break;
				case "select":
					newDiv = controls_buildselect(elem.attr("id").substr(0,elem.attr("id").indexOf("_")));
					break;
				case "multiselect":
					newDiv = controls_buildmultiselect(elem.attr("id").substr(0,elem.attr("id").indexOf("_")));
					break;
				case "textwithselect":
					newDiv = controls_buildtextwithselect(elem.attr("id").substr(0,elem.attr("id").indexOf("_")));
					break;
				case "singledate":
					newDiv = controls_buildsingledate(elem.attr("id").substr(0,elem.attr("id").indexOf("_")));
					break;
				case "doubledate":
					newDiv = controls_builddoubledate(elem.attr("id").substr(0,elem.attr("id").indexOf("_")));
					break;
				default:
					//this is just going to be a copy of what they are dragging. Better than sending nothing.
				var newDiv = $(ui.helper).clone(false)
				.removeClass('helper')
               .css({position:'relative', left:0, top:0})
			   .append('ERROR IN CONTROL JSON<img src="images/red-x.gif" class="redx" /><br style="clear: both">');  
			}
			
			$(newDiv).removeClass('helper')
				.addClass('dropped')
               .css({position:'relative', left:0, top:0})
			   .append('<img src="images/red-x.gif" class="redx" /><br style="clear: both">');  
			 
           $(this).append(newDiv);
		   $( ".datepicker" ).datepicker();
		   $("#deleteme").remove();
		   $(".redx").click(redx_deleteparentnode);
		   $(".multiselect").multiselect();
		}
		
		function controls_buildradiogroup(idx)//1
		{
			var jc = JSON.parse(controls);
			var elem = jc.controls.filter(function(val){return val.id == idx})[0];
			var newcontrol = $('<div id="' + elem.id + '_' + elem.type + '_' + totalcontrolscount + '"  class="draggable"></div>');
			$(newcontrol).append(elem.name + ' &nbsp;');
			var selected = true;
			jQuery.each(elem.options, function (k,v){	
				$(newcontrol).append('<input type="radio" id="' + elem.id + '_' + totalcontrolscount + '" ' + (selected ? ' checked ' : '') + 'name="' + elem.id + '_' + totalcontrolscount + '" value="' +  elem.options[k].value + '">' + elem.options[k].label + '</input>');
				selected = false;
			});
			
			return $(newcontrol);
			
		}
		
		function controls_buildcheckboxgroup(idx)
		{
			var selected = true;
			var jc = JSON.parse(controls);
			var elem = jc.controls.filter(function(val){return val.id == idx})[0];
			var newcontrol = $('<div id="' + elem.id + '_' + elem.type + '_' + totalcontrolscount + '" class="draggable"></div>');
			$(newcontrol).append(elem.name + ' &nbsp;');
			jQuery.each(elem.options, function (k,v){	
				$(newcontrol).append('<input type="checkbox" id="' + elem.id + '" ' + (selected ? ' checked ' : '') + 'name="' + elem.id + '" value="' +  elem.options[k].value + '">' + elem.options[k].label + '</input>');
				selected = false
			});
			return $(newcontrol);
			
		}
		
		function controls_buildselect(idx)
		{
			var jc = JSON.parse(controls);
			var elem = jc.controls.filter(function(val){return val.id == idx})[0];
			var newcontrol = $('<div id="' + elem.id + '_' + elem.type + '_' + totalcontrolscount + '" class="draggable"></div>');
			$(newcontrol).append(elem.name + ' &nbsp;');
			var newselect = $('<select id="' + elem.id + '" name="' + elem.id + '"></select>')
			jQuery.each(elem.options, function (k,v){	
				$(newselect).append('<option value="' +  elem.options[k].value + '">' + elem.options[k].label + '</option>');
			});
			$(newcontrol).append(newselect);
			return $(newcontrol);
		}


		function controls_buildmultiselect(idx)
		{
			var jc = JSON.parse(controls);
			var elem = jc.controls.filter(function(val){return val.id == idx})[0];
			var newcontrol = $('<div id="' + elem.id + '_' + elem.type + '_' + totalcontrolscount + '" class="draggable"></div>');
			var newselect = $('<select id="' + elem.id + '_' + totalcontrolscount + '" name="' + elem.id + '_' + totalcontrolscount + '" class="multiselect"></select>')
			jQuery.each(elem.options, function (k,v){	
				$(newselect).append('<option value="' +  elem.options[k].value + '">' + elem.options[k].label + '</option>');
			});
			$(newcontrol).append(elem.name + ' &nbsp;');
			$(newcontrol).append(newselect);
			return $(newcontrol);
			
		}

		
		function controls_buildsingledate(idx)
		{
			var jc = JSON.parse(controls);
			var elem = jc.controls.filter(function(val){return val.id == idx})[0];
			var newcontrol = $('<div id="' + elem.id + '_' + elem.type + '_' + totalcontrolscount + '" class="draggable"></div>');
			var newinput = $('<input type="text" id="' + elem.id + '_' + totalcontrolscount + ' name="' + elem.id + '_' + totalcontrolscount + '" class="datepicker"></input>');
			$(newcontrol).append(elem.name);
			$(newcontrol).append(newinput);
			
			return $(newcontrol);
		}
		
		function controls_builddoubledate(idx)
		{
			var jc = JSON.parse(controls);
			var elem = jc.controls.filter(function(val){return val.id == idx})[0];
			var newcontrol = $('<div id="' + elem.id + '_' + elem.type + '_' + totalcontrolscount + '" class="draggable"></div>');
			var newinput = $('<input type="text" id="' + elem.id + '_' + totalcontrolscount + '_1" name="' + elem.id + '_' + totalcontrolscount + '_1" class="datepicker" size="7"></input> AND <input type="text" id="' + elem.id + '_' + totalcontrolscount + '_2" name="' + elem.id + '_' + totalcontrolscount + '_2" class="datepicker" size="7"></input>');
			$(newcontrol).append(elem.name + ' between ');
			$(newcontrol).append(newinput);
			
			return $(newcontrol);
			
		}

		function controls_buildtextwithselect(idx)
		{
			var jc = JSON.parse(controls);
			var elem = jc.controls.filter(function(val){return val.id == idx})[0];
			var newcontrol = $('<div id="' + elem.id + '_' + elem.type + '_' + totalcontrolscount + '" class="draggable"></div>');
			var newinput = $('<input type="text" id="' + elem.id + '_' + totalcontrolscount + '" name="' + elem.id + '_' + totalcontrolscount + '" size="7"></input>');
			var newselect = $('<select id="' + elem.id + '_' + totalcontrolscount + '" name="' + elem.id + '_' + totalcontrolscount + '"></select>')
			jQuery.each(elem.options, function (k,v){	
				$(newselect).append('<option value="' +  elem.options[k].value + '">' + elem.options[k].label + '</option>');
			});

			$(newcontrol).append(elem.name + ' ' );
			$(newcontrol).append(newselect).append('&nbsp;').append(newinput);
			
			return $(newcontrol);
			
		}

		
		function redx_deleteparentnode()
		{
		totalcontrolscount--;
		this.parentNode.remove();
		}