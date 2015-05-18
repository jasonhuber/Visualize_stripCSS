	var jc = JSON.parse(controls);
	
	function buildjsonforcontrols()
	{	var jsonobj = {};
		jsonobj.groups = [];
		//find each group. These groups are always tagged destination
		var groups = $(".destination");
		
		$.each(groups, function (k,v){
			var groupjson = getJSONforsinglegroup(groups,k,v);
			
			jsonobj.groups.push(groupjson);
		});//end each groups
		return JSON.stringify(jsonobj);
	}

	function getJSONforsinglegroup(groups, k,v)
	{
			var groupjson = {};
			var xcontrols = $(groups[k]).find(".draggable");
			groupjson.id = k;
			groupjson.controls = [];
			$.each(xcontrols, function (i,x)
			{
				var controljson = {};
				controljson.type = $(xcontrols[i]).attr("id").substr(0,$(xcontrols[i]).attr("id").indexOf("_"));
				controljson.values = [];
				
				var elem = jc.controls.filter(function(val){return val.id == controljson.type})[0];
				var values = [];
				switch(elem.type) {
				case "radiogroup":
					var selections = $(xcontrols[i]).find("input:radio:checked");
					$.each(selections, function (i,x)
					{
						values.push(selections[i].value);
					});					
					break;
				case "checkboxgroup":
					var selections = $(xcontrols[i]).find("input:checkbox:checked");
					$.each(selections, function (i,x)
					{
						values.push(selections[i].value);
					});
					break;
				case "select":
					values.push($(xcontrols[i]).find("select").val());
					break;
				case "multiselect":
					var array_of_checked_values = $(xcontrols[i]).find("select").multiselect("getChecked").map(function(){
					return this.value;    
					}).get();
					for(var i=0; i<array_of_checked_values.length;i++)
					{
						values.push(array_of_checked_values[i]);
					}
					break;
				case "singledate":
					values.push( $(xcontrols[i]).find("input:text").val());
					break;
				case "doubledate":
						var dateelems = $(xcontrols[i]).find("input:text")
						if(dateelems.length != 2)
						{
							console.log("An error with a double date has occurred....");
							break;
						}
						else
						{
							values.push($(dateelems[0]).val());
							values.push($(dateelems[1]).val());
						}
						break;
				case "textwithselect":
					values.push($(xcontrols[i]).find("select").val() );
					values.push($(xcontrols[i]).find("input:text").val() );
					break;
				default:
				}
				controljson.values.push(values);
				groupjson.controls.push(controljson);
				});//end each controls
				
				return groupjson;
	}
	
	function savereport()
	{
		var reportname = prompt("Please give this saved report a name.", "Saved Report Name");
		(_debug)?console.debug(buildjsonforcontrols()):null;
		var _where = buildwhereclause();
		var postdata ='<reportExecutionRequest><reportUnitUri>/public/Planet_Fr/Reports/SaveReport</reportUnitUri><async>true</async><freshData>false</freshData><saveDataSnapshot>false</saveDataSnapshot><outputFormat>csv</outputFormat><interactive>false</interactive><ignorePagination>true</ignorePagination><parameters><reportParameter name="pJSON"><value><![CDATA[' + encodeURIComponent(buildjsonforcontrols()) + ']]></value></reportParameter><reportParameter name="Pwhere"><value><![CDATA[' + _where + ']]></value></reportParameter><reportParameter name="pReportName"><value>' + reportname + '</value></reportParameter><reportParameter name="Phtml"><value>' + encodeURIComponent($("#main").html()) + '</value></reportParameter></parameters></reportExecutionRequest>';
		
		$.ajax( {url:_url + "/" + _installdir + "/rest_v2/reportExecutions", contentType: 'application/xml', type: 'POST',data:postdata, username: _username, password: _password})
		  .done(function( data ) {
			$($("div[role='dialog']").find("button")[3]).text("Saved!");
		  });
	}
	
		function showsaved()
		{
				var requestId = "";
			$.ajax( {url:_url + "/" + _installdir + "/rest_v2/reportExecutions", contentType: 'application/xml', type: 'POST',data:'<reportExecutionRequest><reportUnitUri>/public/Planet_Fr/Reports/LoadSaved</reportUnitUri><async>true</async><freshData>false</freshData><saveDataSnapshot>false</saveDataSnapshot><outputFormat>csv</outputFormat><interactive>false</interactive><ignorePagination>true</ignorePagination><parameters></parameters></reportExecutionRequest>', username: _username, password: _password})
			.done(function( data ) {
				requestId = $(data).find("requestId").html();
				$.ajax( {url:_url + "/" + _installdir + "/rest_v2/reportExecutions/" + requestId , type: 'GET', username: _username, password: _password})
				.done(function( data ) {
					$.ajax( {url:_url + "/" + _installdir + "/rest_v2/reportExecutions/" + requestId + "/exports/" + $(data).find("id").html() + "/outputResource", type: 'GET', username: _username, password: _password})
					.done(function( data ) {
						var csvarray = $.csv2Array(data);
						var newselect = $('<select id="savedReports"></select>')
						jQuery.each(csvarray, function (k,v){	
							$(newselect).append('<option value="' +  csvarray[k][3] + '">' + csvarray[k][5] + '-' + csvarray[k][4] + '</option>');
						});
					$("#dialog").html(newselect);		
						$("#dialog").dialog({title: "Total Results",
						minWidth:400,
							buttons:[
								{text: "OK", click: function() {

								rebuildControlsfromJSON(decodeURIComponent($("#savedReports").val()), true);
								
								$( this ).dialog( "close" );}}]});
					});
				});
		  });
		}
		
	function rebuildControlsfromJSON(jsonstring, clearmain)
	{
		var jsonobj = jQuery.parseJSON(jsonstring);
		if(clearmain)
		{
			$("#main").html("");
			groups = 0;
			groupindexer = 1;
		}
		$.each(jsonobj.groups, function(key,value) {
			//I am in one of several groups
			group_addGroup();
			//currentgroup should be #destinationgroupindexer-- (minus 1)
			var group = $("#destination" + (groupindexer-1) );
			$.each(value.controls, function(k,v) {
				var elem = jc.controls.filter(function(val){return val.id == v.type})[0];
				var curcont = "";
				switch(elem.type) {
				case "radiogroup":
					newDiv = controls_buildradiogroup(elem.id);
					var radios = $(newDiv).find("input:radio");
					$.each(radios, function(i,j){
						$(j).prop("checked",false);
						$.each(v.values, function(indx,valluu)
						{
							if(valluu == $(j).val())
							{
								$(j).prop("checked", true);
							}
						});
					});
					break;
				case "checkboxgroup":
					newDiv = controls_buildcheckboxgroup(elem.id);
					var checkboxes = $(newDiv).find("input:radio");
					$.each(checkboxes, function(i,j){
						$(j).prop("checked",false);
						$.each(v.values, function(indx,valluu)
						{
							if(valluu == $(j).val())
							{
								$(j).prop("checked", true);
							}
						});
					});
					break;
				case "select":
					newDiv = controls_buildselect(elem.id);
					var options = $(newDiv).find("option");					
					$.each(options, function(i,j){
						$(j).prop("selected",false);
						$.each(v.values, function(indx,valluu)
						{
							if(valluu == $(j).val())
							{
								$(j).prop("selected", true);
							}
						});
					});
					break;
				case "multiselect":
					newDiv = controls_buildmultiselect(elem.id);
					$(newDiv).find("select").multiselect();
					var options = $(newDiv).find("select").multiselect("widget").find(":checkbox");		
					$.each(options, function(ix,j){
						($(j).prop("checked"))?$(j).click():"";
						for(var i = 0; i < v.values[0].length; i++)
						{
							if(v.values[0][i] == $(j).val())
							{
								$(j).click();
							}
						}
					});
					break;
				case "textwithselect":
					newDiv = controls_buildtextwithselect(elem.id);
					var options = $(newDiv).find("option");
					$.each(options, function(i,j){
						$(j).prop("selected",false);
						$.each(v.values[0], function(indx,valluu)
						{
							if(valluu == $(j).val())
							{
								$(j).prop("selected", true);
							}
						});
					});
					var theseboxes = $(newDiv).find("input:text");
					$(theseboxes[0]).val(v.values[0][1]);
					break;
				case "singledate":
					newDiv = controls_buildsingledate(elem.id);
					var theseboxes = $(newDiv).find("input:text");
					$(theseboxes[0]).val(v.values[0][0]);
					//not yet used since we have no single dates///
					break;
				case "doubledate":
					newDiv = controls_builddoubledate(elem.id);
					var theseboxes = $(newDiv).find("input:text");
					$(theseboxes[0]).val(v.values[0][0]);
					$(theseboxes[1]).val(v.values[0][1]);
					break;
				default:
				}
				$(newDiv).addClass('dropped')
               .css({position:'relative', left:0, top:0})
			   .append('<img src="images/red-x.gif" class="redx" /><br style="clear: both">');
			   
			   $(group).append(newDiv);
			});
		}); 
		//$("#main").html(decodeURIComponent($("#savedReports").val()));

		//these next few click events should be placed in a parent wrapper?
		//They are called from at least two places.
		//$(".multiselect").multiselect();
		$(".redx").click(redx_deleteparentnode);
		$(".redxgroup").click(group_redxgroup_deleteparentnode);
		
	}