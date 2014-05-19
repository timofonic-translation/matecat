UI = null;

UI = {
	
    render: function(firstLoad) {
        this.isWebkit = $.browser.webkit;
        this.isChrome = $.browser.webkit && !!window.chrome;
        this.isFirefox = $.browser.mozilla;
        this.isSafari = $.browser.webkit && !window.chrome;
        this.body = $('body');
        this.firstLoad = firstLoad;
        this.pageStep = 100;
        this.isMac = (navigator.platform == 'MacIntel')? true : false;
        
        var page = location.pathname.split('/')[2];
        this.page = ('undefined'==typeof(page)||page == '')? 1 : parseInt(page);

        filtersStrings = (location.hash != '')? location.hash.split('#')[1].split(',') : '';
        this.filters = {};
        $.each(filtersStrings, function() {
            var s = this.split('=');
            UI.filters[s[0]] = s[1];
        });
        this.isFiltered = !$.isEmptyObject(this.filters);
        if(this.isFiltered) {

            if(typeof this.filters.pn != 'undefined') {
                $('#search-projectname').val(this.filters.pn);
            };
        	
            if(typeof this.filters.source != 'undefined') {
                $('#select-source option').each(function(){
                    if($(this).attr('value') == UI.filters.source) {
                        $('#select-source option[selected=selected]').removeAttr('selected');
                        $(this).attr('selected','selected');
                    }
                })
            };

            if(typeof this.filters.target != 'undefined') {
                $('#select-target option').each(function(){
                    if($(this).attr('value') == UI.filters.target) {
                        $('#select-target option[selected=selected]').removeAttr('selected');
                        $(this).attr('selected','selected');
                    }
                })    	
            };

            if(typeof this.filters.status != 'undefined') {
                $('#select-status option[selected=selected]').removeAttr('selected');
                $('#select-status option[value='+this.filters.status+']').attr('selected','selected');
            } else {
                $('#select-status option[selected=selected]').removeAttr('selected');
                $('#select-status option[value=active]').attr('selected','selected');        		
            };

            if(typeof this.filters.onlycompleted != 'undefined') {
                $('#only-completed').attr('checked','checked');
            };

            this.body.addClass('filterOpen');

        } else {
        	this.body.removeClass('filterOpen filterActive');
	        UI.emptySearchbox();
        }
		var status = (typeof this.filters.status != 'undefined')? this.filters.status : 'active';
		this.body.attr('data-filter-status',status);
		this.getProjects('standard');
    },
    
    init: function() {

		this.body.on('click','.message a.undo',function(e) {  
	        e.preventDefault();
			UI.applyUndo();
	    }).bind('keydown','Meta+f', function(e){ 
            e.preventDefault();
	        $('body').addClass('filterOpen');
	        $('#search-projectname').focus();
        })
		
		$("#contentBox").on('click','td.actions a.cancel',function(e) {  
	        e.preventDefault();
	        UI.changeJobsStatus('job',$(this).parents('tr'),'cancelled');
	    }).on('click','td.actions a.archive',function(e) {  
	        e.preventDefault();
	        UI.changeJobsStatus('job',$(this).parents('tr'),'archived');
	    }).on('click','td.actions a.resume',function(e) {  
	        e.preventDefault();
	        UI.changeJobsStatus('job',$(this).parents('tr'),'active');
	    }).on('click','td.actions a.unarchive',function(e) {  
	        e.preventDefault();
	        UI.changeJobsStatus('job',$(this).parents('tr'),'active');
	    }).on('click','a.cancel-project',function(e) { 
	        e.preventDefault();
	        UI.changeJobsStatus('prj',$(this).parents('.article'),'cancelled');		
	    }).on('click','a.archive-project',function(e) {
	        e.preventDefault();
	        UI.changeJobsStatus('prj',$(this).parents('.article'),'archived');		
	    }).on('click','a.resume-project',function(e) { 
	        e.preventDefault();
	        UI.changeJobsStatus('prj',$(this).parents('.article'),'active','cancelled');		
	    }).on('click','a.unarchive-project',function(e) { 
	        e.preventDefault();
	        UI.changeJobsStatus('prj',$(this).parents('.article'),'active','archived');
	    }).on('click','td.actions a.change',function(e) {;
	        e.preventDefault();
	        UI.changePassword('job',$(this).parents('tr'),0,0);
	    }).on('click','.meter a',function(e) {
	        e.preventDefault();
	    }).on('click','.pagination a',function(e) {
	        e.preventDefault();
			UI.page = $(this).data('page');
			UI.getProjects('page');
		});
	    
	    $('header .filter').click(function(e) {    
	        e.preventDefault();
	        $('body').toggleClass('filterOpen');
	        $('#search-projectname').focus();
	    });

		$('#display').on('click','.status',function(e) {
	        e.preventDefault();
	        $('body').addClass('filterOpen');
	        $('#select-status').focus();
		}).on('click','.completed',function(e) {
	        e.preventDefault();
	        $('body').addClass('filterOpen');
	        $('#only-completed').focus();
		}).on('click','.pname',function(e) {
	        e.preventDefault();
	        $('body').addClass('filterOpen');
	        $('#search-projectname').focus();
		}).on('click','.selected-source',function(e) {
	        e.preventDefault();
	        $('body').addClass('filterOpen');
	        $('#select-source').focus();
		}).on('click','.selected-target',function(e) {
	        e.preventDefault();
	        $('body').addClass('filterOpen');
	        $('#select-target').focus();
		});
	
	    $('.searchbox #exec-filter').click(function(e) {    
	        e.preventDefault();
	        UI.applyFilter();
	    });
	
	    $('.searchbox #clear-filter').click(function(e) {    
	        e.preventDefault();
	        $('body').removeClass('filterOpen filterActive').attr('data-filter-status','active');
	        UI.filters = {};
	        UI.page = 1;
	        UI.emptySearchbox();
	        UI.getProjects('standard');
	    });

	    $('.searchbox #show-archived, .searchbox #show-cancelled').click(function(e) {   
	        if ($(this).is(':checked')) {
		        $('.searchbox #only-completed').removeAttr('checked');        	
	        }
	    });
	    $('.searchbox #only-completed').click(function(e) {    
	        if ($(this).is(':checked')) {
		        $('.searchbox #show-archived, .searchbox #show-cancelled').removeAttr('checked');        	
	        }
	    });
	},

    appendTime: function() {
        var t = new Date();
        return '&time='+t.getTime();
    },

    applyFilter: function() {
        if($('#search-projectname').val() != '') {
        	this.filters['pn'] = $('#search-projectname').val();
        } else {
        	delete this.filters['pn'];	        	
        }

        if($('#select-source').val() != '') {
        	this.filters['source'] = $('#select-source').val();
        } else {
        	delete this.filters['source'];	        	
        }

        if($('#select-target').val() != '') {
        	this.filters['target'] = $('#select-target').val();
        } else {
        	delete this.filters['target'];
        }

        if($('#select-status').val() != '') {
        	this.filters['status'] = $('#select-status').val();
        	this.body.attr('data-filter-status', $('#select-status').val());
        } else {
        	delete this.filters['status'];
        }

        if($('#only-completed').is(':checked')) {
        	this.filters['onlycompleted'] = 1;
        } else {
        	delete this.filters['onlycompleted'];
        }

        this.filters['filter'] = 1;

        this.page = 1;
		this.getProjects('filter');
		this.body.addClass('filterActive');
    },

    applyUndo: function() {
		var undo = $('.message a.undo');
		switch($(undo).data('operation')) {

			case 'changeStatus':
				$('.message').hide();
				var new_status = $(undo).data('status');
				var res = $(undo).data('res');
				var id = $(undo).data('id');
				var password = $(undo).data('password');
				var ob = (res=='job')? $('tr.row[data-jid=' + id + ']') : $('.article[data-pid=' + id + ']');
				var d = {
						action:		"changeJobsStatus",
						new_status: new_status,
						res: 		res,
						id:			id,
						jpassword: password,
		                page:		UI.page,
		                step:		UI.pageStep,
		                undo:		1
					}
				ar = $.extend(d,UI.filters);
				
				APP.doRequest({
					data: ar,
					context: ob,
					success: function(d){
						if(d.data == 'OK') {
							res = ($(this).hasClass('row'))? 'job':'prj';
							UI.changeJobsStatus_success(res,$(this),d,1);
						}
					}
				});

				break;

			case 'changePassword':
				$('.message').hide();
				var res = $(undo).data('res');
				var id = $(undo).data('id');
				var pwd = $(undo).data('password');
				var ob = (res=='job')? $('tr.row[data-jid=' + id + ']') : $('.article[data-pid=' + id + ']');
				UI.changePassword( res, ob, pwd, undo );

				break;

			default:
		}

    },
    
    balanceAction: function(res,ob,d,undo,project) {

		// check if the project have to be hidden
		filterStatus = this.body.attr('data-filter-status');
		rowsInFilter = $('.article[data-pid='+project.attr('data-pid')+'] tr.row[data-status='+filterStatus+']').length;
		if(!rowsInFilter) {
			project.addClass('invisible')
		} else {
			project.removeClass('invisible');
		}
		// check if there is need to append or delete items
		numItem = $('.article:not(.invisible)').length;
		if(numItem < this.pageStep) {
			if(typeof d != 'undefined') this.renderProjects(d.newItem,'append');
		} else if(numItem > this.pageStep) {
			$('.article:not(.invisible)').last().remove();
		}

    },

    changeJobsStatus: function(res,ob,status,only_if) {
		console.log('ob: ', ob);
        if(typeof only_if == 'undefined') only_if = 0;

        if(res=='job') {
        	UI.lastJobStatus = ob.data('status');
        	id        = ob.data('jid');
        	jpassword = ob.data('password');
		console.log('jpassword: ', jpassword);

		} else {
		    var arJobs = '';
		    $("tr.row",ob).each(function(){
		        arJobs += $(this).data('jid')+':'+$(this).data('status')+',';
		    })
		    arJobs = arJobs.substring(0, arJobs.length - 1);
		    UI.lastJobStatus = arJobs;
		    id = ob.data('pid');
            jpassword = null;
        }

        var d = {
				action:		"changeJobsStatus",
				new_status: status,
				res: 		res,
				id:			id,
                jpassword:  jpassword,
                page:		UI.page,
                step:		UI.pageStep,
                only_if:	only_if,
                undo:		0
			}
		ar = $.extend(d,UI.filters);

		APP.doRequest({
			data: ar,
			context: ob,
			success: function(d){
				if(d.data == 'OK') {
					res = ($(this).hasClass('row'))? 'job':'prj';
					if(res=='prj') {
						UI.getProject(this.data('pid'));
					}
					UI.changeJobsStatus_success(res,$(this),d,0);
					UI.setPagination(d);
				}
			}
		});
    },

    changeJobsStatus_success: function(res,ob,d,undo) {
        if(res == 'job') {
			project = ob.parents('.article');
			if(undo) {
				ob.attr('data-status',d.status);				
			} else {
				id = ob.data('jid');
				if(d.status == 'cancelled') {
					msg = 'A job has been cancelled.';
				} else if(d.status == 'archived') {
					msg = 'A job has been archived.';
				} else if(d.status == 'active') {
					msg = 'A job has been resumed as active.';
				}
				ob.attr('data-status',d.status).attr('data-password',ob.data('password'));
			}

		} else {
			project = ob;
			if(undo) {
				$.each(d.status.split(','), function() {
					var s = this.split(':');
					$('tr.row[data-jid='+s[0]+']').attr('data-status',s[1]);
				})
			} else {
				id = ob.data('pid');
				if(d.status == 'cancelled') {
					msg = 'All the jobs in a project has been cancelled.';
				} else if(d.status == 'archived') {
					msg = 'All the jobs in a project has been archived.';
				} else if(d.status == 'active') {
					msg = 'All the jobs in a project has been resumed as active.';
				}	
				$('tr.row',project).each(function(){
					$(this).attr('data-status',d.status);
			    })
			}
		}
		if(!undo) {
			var token =  new Date();
			var resData = (res == 'prj')? 'pid':'jid';
			$('.message').attr('data-token',token.getTime()).html(msg + ' <a href="#" class="undo" data-res="' + res + '" data-id="' + ob.data(resData)+ '" data-password="' + ob.data('password') + '" data-operation="changeStatus" data-status="' + ((res == 'prj')? d.old_status : this.lastJobStatus) + '">Undo</a>').show();
			setTimeout(function(){
//				$('.message[data-token='+token.getTime()+']').hide();
			},5000);
		}
		this.balanceAction(res,ob,d,undo,project);
    },

    changePassword: function(res,ob,pwd,undo) {
        if(typeof pwd == 'undefined') pwd = false;
        if(res=='job') {
        	id = ob.data('jid');
        	password = (pwd)? pwd : ob.data('password');
        }

        if( undo ){
            old_password = $(undo).data('old_password');
        } else {
            old_password = null;
        }

        APP.doRequest({
            data: {
                action:		    "changePassword",
                res: 		    res,
                id: 		    id,
                password: 	    password,
                old_password: 	old_password,
                undo:           ( typeof undo == 'object' )
            },
            context: ob,
            success: function(d){
                res = ($(this).hasClass('row'))? 'job':'prj';
                UI.changePassword_success(res,$(this),d,undo);
            }
        });
    },

    changePassword_success: function(res,ob,d,undo) {
		var jd = $(ob).find('.job-detail');
		var newPwd = d.password;
		uu = $('.urls .url',jd);
		uuh = uu.attr('href');
		uuhs = uuh.split('-');
		oldPwd = uuhs[uuhs.length-1];
		newHref = uuh.replace(oldPwd,newPwd);
		uu.attr('href',newHref);
		newCompressedHref = this.compressUrl(newHref);
		$('.urls .url',jd).text(newCompressedHref);
		$(jd).effect("highlight", {}, 1000);

		if(res == 'job') {
			ob.attr('data-password',d.password);				
			if(undo) {
				msg = 'A job password has been restored.';
			} else {
				msg = 'A job password has been changed.';	
			}

		} else {
		}

		if(!undo) {

            console.log(res);
            console.log(ob);
            console.log(d);
            console.log(undo);
            console.log(newPwd);
            console.log(oldPwd);

			var token =  new Date();
			var resData = (res == 'prj')? 'pid':'jid';
			$('.message').attr('data-token',token.getTime()).html(msg + ' <a href="#" class="undo" data-res="' + res + '" data-id="' + ob.data(resData)+ '" data-operation="changePassword" data-password="' + newPwd + '" data-old_password="' + oldPwd + '">Undo</a>').show();
			setTimeout(function(){
				$('.message[data-token='+token.getTime()+']').hide();
			},5000);
		}

    },

    compileDisplay: function() {
    	var status = (typeof this.filters.status != 'undefined')? this.filters.status : 'active';
    	var pname = (typeof this.filters.pn != 'undefined')? ' "<a class="pname" href="#">' + this.filters.pn + '</a>" in the name,' : '';
    	var source = (typeof this.filters.source != 'undefined')? ' <a class="selected-source" href="#">' + $('#select-source option[value='+this.filters.source+']').text() + '</a> as source language,' : '';
    	var target = (typeof this.filters.target != 'undefined')? ' <a class="selected-target" href="#">' + $('#select-target option[value='+this.filters.target+']').text() + '</a> as target language,' : '';
    	var completed = (typeof this.filters.onlycompleted != 'undefined')? ' <a class="completed">completed</a>' : '';
    	var ff = ((pname != '')||(source != '')||(target != ''))? ' having' : '';
    	var tt = 'Showing' + completed + ' <a class="status" href="#">' + status + '</a> projects' + ff + pname + source + target;
    	tt = tt.replace(/\,$/, '');
    	$('#display').html(tt);
	},

    compressUrl: function(url) {
		var arr = url.split('/');
		compressedUrl = config.hostpath + '/translate/.../' + arr[4];
		return compressedUrl;
	},

    emptySearchbox: function() {
        $('#search-projectname').val('');
        $('#select-source option[selected=selected]').removeAttr('selected');
        $('#select-source option').first().attr('selected','selected');
        $('#select-target option[selected=selected]').removeAttr('selected');
        $('#select-target option').first().attr('selected','selected');
        $('#select-status option[selected=selected]').removeAttr('selected');
        $('#select-status option').first().attr('selected','selected');
    },

    filters2hash: function() {
		var hash = '#';
		$.each(this.filters, function(key,value) {
			hash += key + '=' + value + ',';
		})
		hash = hash.substring(0, hash.length - 1);
		return hash;
    },

    getProject: function(id) {
		var d = {
                action: 'getProjects',
                project: id,
                page:	UI.page
			}
		ar = $.extend(d,UI.filters);
		
		APP.doRequest({
			data: ar,
			success: function(d){
				data = $.parseJSON(d.data);
				UI.renderProjects(data,'single');
				UI.setTablesorter();
			}
		});
	},

    getProjects: function(what) {
		UI.body.addClass('loading');
		var d = {
                action: 'getProjects',
                page:	UI.page
			}
		ar = $.extend(d,UI.filters);
		
		APP.doRequest({
			data: ar,
			success: function(d){
				UI.body.removeClass('loading');
				data = $.parseJSON(d.data);
				UI.setPagination(d);
				UI.renderProjects(data,'all');
				if((d.pnumber - UI.pageStep) > 0) UI.renderPagination(d.page,0,d.pnumber);
				UI.setTablesorter();
				var stateObj = { page: d.page };

				if(what == 'filter') {
					history.pushState(stateObj, "page "+d.page, d.page+UI.filters2hash());
				} else if(what == 'page') {
					history.pushState(stateObj, "page "+d.page, d.page+UI.filters2hash());
				} else {
					history.replaceState(stateObj, "page "+d.page, d.page+UI.filters2hash());
				}
				UI.compileDisplay();
		        $("html,body").animate({
		            scrollTop: 0
		        }, 500 );
			}
		});
	},

    renderPagination: function(page,top,pnumber) {
    	page = parseInt(page);
    	
    	var prevLink = (page>1)? '<a href="#" data-page="' + (page-1) + '">&lt;</a>' : '';
    	var aroundBefore = (page==1)? '<strong>1</strong>' : (page==2)? '<a href="#" data-page="1">1</a><strong>2</strong>' : (page==3)? '<a href="#" data-page="1">1</a><a href="#" data-page="2">2</a><strong>3</strong>' : (page==4)? '<a href="#" data-page="1">1</a><a href="#" data-page="2">2</a><a href="#" data-page="3">3</a><strong>4</strong>' : '<a href="#" data-page="1">1</a>...<a href="#" data-page="'+(page-2)+'">'+(page-2)+'</a><a href="#" data-page="'+(page-1)+'">'+(page-1)+'</a><strong>'+page+'</strong>';
    	var pages = Math.floor(pnumber/UI.pageStep)+1;
     	var nextLink = (page<pages)? '<a href="#" data-page="' + (page+1) + '">&gt;</a>' : '';
    	var aroundAfter = (page==pages)? '' : (page==pages-1)? '<a href="#" data-page="'+(page+1)+'">'+(page+1)+'</a>' : (page==pages-2)? '<a href="#" data-page="'+(page+1)+'">'+(page+1)+'</a><a href="#" data-page="'+(page+2)+'">'+(page+2)+'</a>' : (page==pages-3)? '<a href="#" data-page="'+(page+1)+'">'+(page+1)+'</a><a href="#" data-page="'+(page+2)+'">'+(page+2)+'</a><a href="#" data-page="'+(page+3)+'">'+(page+3)+'</a>' : '<a href="#" data-page="'+(page+1)+'">'+(page+1)+'</a><a href="#" data-page="'+(page+2)+'">'+(page+2)+'</a>...<a href="#" data-page="'+(pages)+'">'+(pages)+'</a>';

     	var fullLink = prevLink + aroundBefore + aroundAfter + nextLink;

	   	if(top) {
    		if($('.pagination.top').length) {
    			$('.pagination.top').html(fullLink);
    		} else {
    			$('#contentBox h1').after('<div class="pagination top">'+fullLink+'</div>');
    		}
    	} else {
    		if($('.pagination.bottom').length) {
    			$('.pagination.bottom').html(fullLink);
    		} else {
    			$('#contentBox').append('<div class="pagination bottom">'+fullLink+'</div>');
    		}
    	}

	},

    renderProjects: function(d,action) {

        this.retrieveTime = new Date();
        var projects = '';
        $.each(d, function() {
            var project = this;
            var newProject = '';

			newProject += '<div data-pid="'+this.id+'" class="article">'+
	            '	<div class="head">'+
		        '	    <h2>'+this.name+'</h2>'+
		        '	    <div class="project-details">';

            if(config.v_analysis){
                newProject += '			<span class="id-project" title="Project ID">'+this.id+'</span> - <a target="_blank" href="/analyze/'+project.name+'/'+this.id+'-'+this.password+'" title="Volume Analysis">'+this.tm_analysis+' Payable words</a>';
            }

            newProject += '			<a href="#" title="Cancel project" class="cancel-project"></a>'+
		        '	    	<a href="#" title="Archive project" class="archive-project"></a>'+
		        '			<a href="#" title="Resume project" class="resume-project"></a>'+
		        '	    	<a href="#" title="Unarchive project" class="unarchive-project"></a>'+
		        '		</div>'+
	            '	</div>'+
	            '	<div class="field">'+
	            '		<h3>Machine Translation:</h3>'+
	            '		<span class="value">' + this.mt_engine_name + '</span>'+
	            '	</div>';

//            if (this.private_tm_key!==''){
//                    
//                     newProject += '	<div class="field">'+
//	            '		<h3>Private TM Key:</h3>'+
//	            '		<span class="value">'+this.private_tm_key+'</span>'+
//	            '	</div>';
//            }
                    
		      newProject += '    <table class="tablestats continue tablesorter" width="100%" border="0" cellspacing="0" cellpadding="0" id="project-'+this.id+'">'+
		        '        <thead>'+
			    '            <tr>'+
			    '                <th class="create-date header">Create Date</th>'+
			    '                <th class="job-detail">Job</th>'+
			    '                <th class="private-tm-key">Private TM Key</th>';

            if(config.v_analysis){
                newProject += '                <th class="words header">Payable Words</th>';
            }

            newProject += '                <th class="progress header">Progress</th>'+
			    '                <th class="actions">Actions</th>'+
			    '            </tr>'+
		        '        </thead>'+
				'		<tbody>';

    		$.each(this.jobs, function() {
            var prefix = (APP.objectSize(this) > 1)? true : false;
            var ind = 0;
            $.each(this, function() {
                ind++;
		        var newJob = '    <tr class="row " data-jid="'+this.id+'" data-status="'+this.status+'" data-password="'+this.password+'">'+
		            '        <td class="create-date" data-date="'+this.create_date+'">'+this.formatted_create_date+'</td>'+
		            '        <td class="job-detail">'+
		            '        	<span class="urls">'+
		            '        		<div class="jobdata">'+this.id+((prefix)? '-'+ind : '')+'</div>'+
		            '        		<div class="langs">'+this.sourceTxt+'&nbsp;&gt;&nbsp;'+this.targetTxt+'</div>'+
		            '        		<a class="url" target="_blank" href="/translate/'+project.name+'/'+this.source+'-'+this.target+'/'+this.id+((prefix)? '-'+ind : '')+'-'+this.password+'">'+config.hostpath+'/translate/.../'+this.id+((prefix)? '-'+ind : '')+'-'+this.password+'</a>'+
		            '        	</span>'+
		            '        </td>'+
		            '        <td class="tm-key">'+
		            '        	<span>'+ ((typeof this.private_tm_key == 'undefined')? '': this.private_tm_key) + '</span>'+
		            '        </td>';
                if(config.v_analysis){
                    newJob += '        <td class="words">'+this.stats.TOTAL_FORMATTED+'</td>';
                }

                newJob += '        <td class="progress">'+
				    '            <div class="meter">'+
				    '                <a href="#" class="approved-bar" title="Approved '+this.stats.APPROVED_PERC_FORMATTED+'%" style="width:'+this.stats.APPROVED_PERC+'%"></a>'+
				    '                <a href="#" class="translated-bar" title="Translated '+this.stats.TRANSLATED_PERC_FORMATTED+'%" style="width:'+this.stats.TRANSLATED_PERC+'%"></a>'+
				    '                <a href="#" class="rejected-bar" title="Rejected '+this.stats.REJECTED_PERC_FORMATTED+'%" style="width:'+this.stats.REJECTED_PERC+'%"></a>'+
				    '                <a href="#" class="draft-bar" title="Draft '+this.stats.DRAFT_PERC_FORMATTED+'%" style="width:'+this.stats.DRAFT_PERC+'%"></a>'+
				    '            </div>'+
		            '        </td>'+
		            '        <td class="actions">'+
		            '            <a class="change" href="#" title="Change job password">Change</a>'+
		            '            <a class="cancel" href="#" title="Cancel Job">Cancel</a>'+
		            '            <a class="archive" href="#" title="Archive Job">Archive</a>'+
		            '            <a class="resume" href="#" title="Resume Job">Resume</a>'+
		            '            <a class="unarchive" href="#" title="Unarchive Job">Unarchive</a>'+
		            '        </td>'+
		            '    </tr>';

				newProject += newJob;
            })
        });

			newProject +='		</tbody>'+	
	        '    </table>'+
            '</div>';

    		projects += newProject;
        });
        if(action == 'append') {
	        $('#projects').append(projects);  	
        } else if(action == 'single') {
        	$('.article[data-pid='+d[0].id+']').replaceWith(projects);
        } else {
	        if(projects == '') projects = '<p class="article msg">No projects found for these filter parameters.<p>';
	        $('#projects').html(projects);        	        	
        }

    }, // renderProjects

    setPagination: function(d) {
		if((d.pnumber - UI.pageStep) > 0) {
			this.renderPagination(d.page,1,d.pnumber);
		} else {
			$('.pagination').empty();
		}
	},
	
    setTablesorter: function() {
	    $(".tablesorter").tablesorter({
	        textExtraction: function(node) { 
	            // extract data from markup and return it  
	            if($(node).hasClass('create-date')) {
	            	return $(node).data('date');
	            } else {
	            	return $(node).text();
	            }
	        }, 
	        headers: { 
	            1: { 
	                sorter: false 
	            }, 
	            4: { 
	                sorter: false 
	            } 
	        }			    	
	    });
    }

} // UI

var monthNames = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];

var dayNames = [ "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];


function setBrowserHistoryBehavior() {
	window.onpopstate = function(e) {
		e.preventDefault();
		if(UI.firstLoad) {
			UI.firstLoad = false;
			return;
		}
		UI.render(false);
	};
}

$(document).ready(function(){
    setBrowserHistoryBehavior();
    UI.render(true);
    UI.init();
});

