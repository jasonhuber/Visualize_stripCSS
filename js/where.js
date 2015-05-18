		function buildwhereclause()
		{	var sql = "";
			// not sure how to handle both groups, but for now if there are more than one group I will OR them with ()
			// so (group1) OR (group2) etc......			
			var groups = $(".destination");
			var sqlnow = "";
			var sqlthen = ""
			var sqlout = "";
			$.each(groups, function (k,v){
				var xcontrols = $(groups[k]).find(".draggable");
				if(xcontrols.length > 0)
				{ 
					if(sql == "")
					{
						sql = "where 1=1 AND (~groupreplace~)"
					}
					else
					{
						sql+= " OR (~groupreplace~)";
					}
				}
				sqlthen = ""; //this holds the where for the group.
				$.each(xcontrols, function (i,x)
				{
					
					var elem = jc.controls.filter(function(val){return val.id == $(xcontrols[i]).attr("id").substr(0,$(xcontrols[i]).attr("id").indexOf("_"))})[0];
					sqlnow = "";
					switch(elem.type) {
					case "radiogroup":
						var selections = $(xcontrols[i]).find("input:radio:checked");
						
						var sqlarr = new Array(selections.length);
						$.each(selections, function (i,x)
						{
							if(elem.datatype == 'number')
							{sqlarr[i] =  selections[i].value + '';}
							else
							{sqlarr[i] = "'" + selections[i].value + "' ";}
							sqlarr[i] = elem.SQL.replace("{0}", sqlarr[i]);
						});
						if(sqlarr.length>1)
							{
							sqlnow = "( ";
								var i = 0;
								while(i<sqlarr.length)
								{ sqlnow +=sqlarr[i];
									if(i + 1 < sqlarr.length)
									{sqlnow += " OR ";}
								i++;} 
							sqlnow += ")  ";
							}
							else
							{
								sqlnow = sqlarr[0];
							}
						
						break;
					case "checkboxgroup":
						var selections = $(xcontrols[i]).find("input:checkbox:checked");
						$.each(selections, function (i,x)
						{
							if(elem.datatype == 'number')
							{sqlnow +=  selections[i].value + ', ';}
							else
							{sqlnow += "'" + selections[i].value + "', ";}
						});
						sqlnow = sqlnow.substr(0,sqlnow.trim().length-1);
						sqlnow = elem.SQL.replace("{0}", sqlnow);
						break;
					case "select":
							if(elem.datatype == 'number')
							{
								sqlnow += elem.SQL.replace("{0}", $(xcontrols[i]).find("select").val());
							}
							else
							{
								sqlnow += elem.SQL.replace("{0}", "'" + $(xcontrols[i]).find("select").val() + "'");
							}
							break;
					case "multiselect":

						var array_of_checked_values = $(xcontrols[i]).find("select").multiselect("getChecked").map(function(){
							return this.value;    
							}).get();
						var sqltemp = "";
							for(var i=0; i<array_of_checked_values.length;i++)
							{
								if(elem.datatype == 'number')
								{
									sqltemp += array_of_checked_values[i];
								}
								else
								{
									sqltemp += "'" + array_of_checked_values[i] + "'";
								}
								if(i+1<array_of_checked_values.length)
								{sqltemp+=" , "}
							}
							sqlnow = elem.SQL.replace("{0}", sqltemp);
						break;
					case "singledate":
							sqlnow += elem.SQL.replace("{0}", "'" + $(xcontrols[i]).find("input:text").val() + "'   ");
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
							if($(dateelems[0]).val() == '')
							{
								$(dateelems[0]).val('01/01/1900');
							}
							if($(dateelems[1]).val() == '')
							{
								var mydate = new Date();
								$(dateelems[1]).val(mydate.getMonth() + 1 + "/" + mydate.getDate() + "/" + (10 + mydate.getFullYear()) );
							}
							
							sqlnow += elem.SQL.replace("{0}", "'" + $(dateelems[0]).val() + "'   ").replace("{1}", "'" + $(dateelems[1]).val() + "'    ");
						}
						break;
					case "textwithselect":
						var valueofselect = $(xcontrols[i]).find("select").val();
						if(elem.datatype == 'string')
						{
							sqlnow = valueofselect.replace("{0}","'" + $(xcontrols[i]).find("input:text").val() + "'");
						}
						else
						{
							sqlnow = valueofselect.replace("{0}",$(xcontrols[i]).find("input:text").val());
						}
						sqlnow = sqlnow.replace(" %'", " '%").replace("'% ", "%' ");
						sqlnow = elem.SQL.replace("{1}", sqlnow) + " " ;
						break;
					default:
					}
					sqlthen += sqlnow + ' AND ';
				});
				if(sqlthen.trim().substr(sqlthen.trim().length-3,4) == "AND")
				{
					sqlthen = sqlthen.substr(0,sqlthen.trim().length-4); //get rid of the trailing AND
				}
				
				sql = sql.replace("~groupreplace~", sqlthen)
			});//end each groups
			(_assert)?alert(sql):null;
			(_debug)?console.debug(sql):null;
			return sql;

		}
		
		function getresultcount()
		{
			var requestId = "";
			$.ajax( {url:_url + "/" + _installdir + "/rest_v2/reportExecutions", contentType: 'application/xml', type: 'POST',data:'<reportExecutionRequest><reportUnitUri>/public/Planet_Fr/Reports/ResultsCount</reportUnitUri><async>true</async><freshData>false</freshData><saveDataSnapshot>false</saveDataSnapshot><outputFormat>csv</outputFormat><interactive>false</interactive><ignorePagination>true</ignorePagination><parameters><reportParameter name="Pwhere"><value><![CDATA[' + buildwhereclause() + ']]></value></reportParameter><reportParameter name="Phtml"><value>' + encodeURIComponent($("#main").html()) + '</value></reportParameter></parameters></reportExecutionRequest>', username: _username, password: _password})
			.done(function( data ) {
				requestId = $(data).find("requestId").html();
				$.ajax( {url:_url + "/" + _installdir + "/rest_v2/reportExecutions/" + requestId , type: 'GET', username: _username, password: _password})
				.done(function( data ) {
					$.ajax( {url:_url + "/" + _installdir + "/rest_v2/reportExecutions/" + requestId + "/exports/" + $(data).find("id").html() + "/outputResource", type: 'GET', username: _username, password: _password})
					.done(function( data ) {
						$("#dialog").html($.trim(data));						
						$("#dialog").dialog({title: "Total Results",
							buttons:[
								{text: "OK", click: function() {$( this ).dialog( "close" );}},
								{ text: "Export", click: function() {runreport();}},
								{ text: "Save", click: function() {savereport();}}]});
					});
				});
		  });
	}
		
		function runreport()
		{
			$.ajax( {url:_url + "/" + _installdir + "/rest_v2/reportExecutions", contentType: 'application/xml', type: 'POST',data:'<reportExecutionRequest><reportUnitUri>/public/Planet_Fr/Reports/CSVOutput</reportUnitUri><async>true</async><freshData>false</freshData><saveDataSnapshot>false</saveDataSnapshot><outputFormat>csv</outputFormat><interactive>false</interactive><ignorePagination>true</ignorePagination><parameters><reportParameter name="someParameterName"><value>value 1</value></reportParameter></parameters></reportExecutionRequest>', username: _username, password: _password})
			  .done(function( data ) {
			//		window.location = _url + "/" + _installdir + "/rest_v2/reportExecutions/" + $(data).find("requestId").html() + "/
				getexecution($(data).find("requestId").html());
				//alert( "The report was run: " + $(data).find("requestId").html() );
			  });
		}
		
		
		function getexecution(execid)
		{
			$.ajax( {url:_url + "/" + _installdir + "/rest_v2/reportExecutions/" + execid, type: 'GET', username: _username, password: _password})
			  .done(function( data ) {
				window.location = _url + "/" + _installdir + "/rest_v2/reportExecutions/" + execid + "/exports/" + $(data).find("id").html() + "/outputResource";
				});
		
		}
		
