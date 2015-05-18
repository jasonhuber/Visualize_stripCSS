	var groups = 0;
	var groupindexer = 1;	
	function group_redxgroup_deleteparentnode()
	{
		this.parentNode.remove();
		groups--;
		groupindexer--;
		console.debug('groupscount: ' + groups  + '- groupindexer: ' + groupindexer);
	}

	function group_addGroup()
	{
		var clonegrouphtml = 'onclick="clonegroup({0})"';
		clonegrouphtml = clonegrouphtml.replace('{0}',"'#destination" + groupindexer + "'");
		
		$("#main").append('<div id="destination' + groupindexer + '" class="droppable destination group">Group <a href="#" ' + clonegrouphtml + '>(++) </a><img src="images/red-x.gif" class="redxgroup" /></div><br style="clear: both" />');
	
		drag_init();
		 $(".redxgroup").click(group_redxgroup_deleteparentnode);
		groups++;
		groupindexer++;
		console.debug('groupscount: ' + groups  + '- groupindexer: ' + groupindexer); 
	}
	
	function clonegroup(grouptoclone)
	{
	
		//this just defaults some stuff for us.
		var _where = buildwhereclause();
		
		var jsonobj = {};
		jsonobj.groups = [];
		
		var groups = $(grouptoclone);
		$.each(groups, function (k,v){
			var groupjson = getJSONforsinglegroup(groups,k,v);
			jsonobj.groups.push(groupjson);
		});//end each groups
		
		rebuildControlsfromJSON(JSON.stringify(jsonobj), false);
		
	}
	
