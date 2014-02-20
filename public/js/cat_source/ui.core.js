/*
	Component: ui.core
 */
UI = null;

UI = {
	toggleFileMenu: function() {

		if ($('#jobMenu').is(':animated')) {
			return false;
		}
		if (this.body.hasClass('editing')) {
			$('#jobMenu .currSegment').show();
		} else {
			$('#jobMenu .currSegment').hide();
		}
		var menuHeight = $('#jobMenu').height();
		var startTop = 47 - menuHeight;
		$('#jobMenu').css('top', (47 - menuHeight) + "px");

		if ($('#jobMenu').hasClass('open')) {
			$('#jobMenu').animate({top: "-=" + menuHeight + "px"}, 500).removeClass('open');
		} else {
			$('#jobMenu').animate({top: "+=" + menuHeight + "px"}, 300, function() {
				$('body').on('click', function(e) {
					if ($('#jobMenu').hasClass('open')) {
						UI.toggleFileMenu();
					}
				});
			}).addClass('open');
		}
	},
	activateSegment: function() {
		this.createFooter(this.currentSegment);
		this.createButtons();
		this.createHeader();
	},
	cacheObjects: function(editarea) {
		this.editarea = $(editarea);
		// current and last opened object reference caching
		this.lastOpenedSegment = this.currentSegment;
		this.lastOpenedEditarea = $('.editarea', this.currentSegment);
		this.currentSegmentId = this.lastOpenedSegmentId = this.editarea.data('sid');
		this.currentSegment = segment = $('#segment-' + this.currentSegmentId);
		this.currentFile = segment.parent();
		this.currentFileId = this.currentFile.attr('id').split('-')[1];
		var sourceTags = $('.source', this.currentSegment).html().match(/(&lt;\s*\/*\s*(g|x|bx|ex|bpt|ept|ph|it|mrk)\s*.*?&gt;)/gi);
		this.sourceTags = sourceTags || [];
	},
	changeStatus: function(ob, status, byStatus) {
		var segment = (byStatus) ? $(ob).parents("section") : $('#' + $(ob).data('segmentid'));
		$('.percentuage', segment).removeClass('visible');
		if (!segment.hasClass('saved'))
			this.setTranslation(segment, status);
		segment.removeClass('saved');
		this.setContribution(segment, status, byStatus);
		this.setContributionMT(segment, status, byStatus);
		this.getNextSegment(this.currentSegment, 'untranslated');
		if(!this.nextUntranslatedSegmentId) {
			$(window).trigger({
				type: "allTranslated"
			});
		};
		$(window).trigger({
			type: "statusChanged",
			segment: segment,
			status: status
		});
	},
	checkHeaviness: function() {
//		console.log('UI.hasToBeRerendered: ', this.hasToBeRerendered);
//		console.log(this.initSegNum + ' - ' + this.numOpenedSegments + ' - ' + (this.initSegNum/this.numOpenedSegments));
//		if (($('section').length > 500)||(this.numOpenedSegments > 2)) {
		if (($('section').length > 500)||((this.initSegNum/this.numOpenedSegments) < 2)||(this.hasToBeRerendered)) {
			UI.reloadToSegment(UI.currentSegmentId);
		}
	},
	checkIfFinished: function(closing) {
		if (((this.progress_perc != this.done_percentage) && (this.progress_perc == '100')) || ((closing) && (this.progress_perc == '100'))) {
			this.body.addClass('justdone');
		} else {
			this.body.removeClass('justdone');
		}
	},
	checkIfFinishedFirst: function() {
		if ($('section').length == $('section.status-translated, section.status-approved').length) {
			this.body.addClass('justdone');
		}
	},
/*
	checkTutorialNeed: function() {
		if (!Loader.detect('tutorial'))
			return false;
		if (!$.cookie('noTutorial')) {
			$('#dialog').dialog({
			});
			$('#hideTutorial').bind('change', function(e) {
				if ($('#hideTutorial').attr('checked')) {
					$.cookie('noTutorial', true);
				} else {
					$.removeCookie('noTutorial');
				}
			});
		}
	},
*/
	closeSegment: function(segment, byButton, operation) {
		if ((typeof segment == 'undefined') || (typeof UI.toSegment != 'undefined')) {
			this.toSegment = undefined;
			return true;
		}

		var closeStart = new Date();
		this.autoSave = false;

		$(window).trigger({
			type: "segmentClosed",
			segment: segment
		});

		clearTimeout(this.liveConcordanceSearchReq); 

		var saveBrevior = true;
		if (operation != 'noSave') {
			if ((operation == 'translated') || (operation == 'Save'))
				saveBrevior = false;
		}
		if ((segment.hasClass('modified')) && (saveBrevior)) {
			this.saveSegment(segment);
		}
		this.deActivateSegment(byButton);

		this.lastOpenedEditarea.attr('contenteditable', 'false');
		this.body.removeClass('editing');
		$(segment).removeClass("editor");
		$('span.locked.mismatch', segment).removeClass('mismatch');
		if (!this.opening) {
			this.checkIfFinished(1);
		}
	},
	copySource: function() {

		var source_val = $.trim($(".source", this.currentSegment).text());
		// Test
		//source_val = source_val.replace(/&quot;/g,'"');

		// Attention I use .text to obtain a entity conversion, by I ignore the quote conversion done before adding to the data-original
		// I hope it still works.

		this.saveInUndoStack('copysource');
		$(".editarea", this.currentSegment).text(source_val).keyup().focus();
		this.saveInUndoStack('copysource');
		$(".editarea", this.currentSegment).effect("highlight", {}, 1000);
		$(window).trigger({
			type: "sourceCopied",
			segment: segment
		});
		this.currentSegment.addClass('modified');
		this.currentSegmentQA();
		this.setChosenSuggestion(0);
		this.lockTags(this.editarea);
	},
	confirmDownload: function(res) {
		if (res) {
			if (UI.isChrome) {
				$('.download-chrome').addClass('d-open');
				setTimeout(function() {
					$('.download-chrome').removeClass('d-open');
				}, 7000);

			}
		}
	},
	copyToNextIfSame: function(nextUntranslatedSegment) {
		if ($('.source', this.currentSegment).data('original') == $('.source', nextUntranslatedSegment).data('original')) {
			if ($('.editarea', nextUntranslatedSegment).hasClass('fromSuggestion')) {
				$('.editarea', nextUntranslatedSegment).text(this.editarea.text());
			}
		}
	},
	createButtons: function() {
		var disabled = (this.currentSegment.hasClass('loaded')) ? '' : ' disabled="disabled"';
		var buttons = '<li><a id="segment-' + this.currentSegmentId + '-nextuntranslated" href="#" class="btn next-untranslated" data-segmentid="segment-' + this.currentSegmentId + '" title="Translate and go to next untranslated">T+&gt;&gt;</a><p>' + ((UI.isMac) ? 'CMD' : 'CTRL') + '+SHIFT+ENTER</p></li><li><a id="segment-' + this.currentSegmentId + '-button-translated" data-segmentid="segment-' + this.currentSegmentId + '" href="#" class="translated"' + disabled + ' >TRANSLATED</a><p>' + ((UI.isMac) ? 'CMD' : 'CTRL') + '+ENTER</p></li>';
		$('#segment-' + this.currentSegmentId + '-buttons').empty().append(buttons);
		$('#segment-' + this.currentSegmentId + '-buttons').before('<p class="warnings"></p>');
	},
	createFooter: function(segment) {
		if ($('.matches .overflow', segment).text() !== '')
			return false;
		if ($('.footer', segment).text() !== '')
			return false; 

		var footer = '<ul class="submenu"><li class="active tab-switcher-tm" id="segment-' + this.currentSegmentId + '-tm"><a tabindex="-1" href="#">Translation matches</a></li><li class="tab-switcher-cc" id="segment-' + this.currentSegmentId + '-cc"><a tabindex="-1" href="#">Concordance</a></li><li class="tab-switcher-gl" id="segment-' + this.currentSegmentId + '-gl"><a tabindex="-1" href="#">Glossary&nbsp;<span class="number"></span></a></li></ul><div class="tab sub-editor matches" id="segment-' + this.currentSegmentId + '-matches"><div class="overflow"></div></div><div class="tab sub-editor concordances" id="segment-' + this.currentSegmentId + '-concordances"><div class="overflow"><div class="cc-search"><div class="input search-source" contenteditable="true" /><div class="input search-target" contenteditable="true" /></div><div class="results"></div></div></div><div class="tab sub-editor glossary" id="segment-' + this.currentSegmentId + '-glossary"><div class="overflow"><div class="gl-search"><div class="input search-source" contenteditable="true" /><div class="input search-target" contenteditable="true" /><!-- a class="search-glossary" href="#"></a --><a class="set-glossary disabled" href="#"></a><div class="comment"><a href="#">(+) Comment</a><div class="input gl-comment" contenteditable="true" /></div></div><div class="results"></div></div></div>';
		$('.footer', segment).html(footer);

		if (($(segment).hasClass('loaded')) && (segment === this.currentSegment) && ($(segment).find('.matches .overflow').text() === '')) {
			
			$('.sub-editor.matches .overflow .graysmall.message', segment).remove();
			$('.sub-editor.matches .overflow', segment).append('<ul class="graysmall message"><li>Sorry, we can\'t help you this time. Check if the language pair is correct. If not, create the project again.</li></ul>');
		}
	},
	createHeader: function() {
		if ($('h2.percentuage', this.currentSegment).length) {
			return;
		}
		var header = '<h2 title="" class="percentuage"><span></span></h2><a href="#" id="segment-' + this.currentSegmentId + '-close" class="close" title="Close this segment"></a><a href="/referenceFile/' + config.job_id + '/' + config.password + '/' + this.currentSegmentId + '" id="segment-' + this.currentSegmentId + '-context" class="context" title="Open context" target="_blank">Context</a>';
		$('#' + this.currentSegment.attr('id') + '-header').html(header);
	},
	createJobMenu: function() {
		var menu = '<nav id="jobMenu" class="topMenu">' +
				'    <ul>';
		$.each(config.firstSegmentOfFiles, function(index) {
			menu += '<li data-file="' + this.id_file + '" data-segment="' + this.first_segment + '"><span class="' + UI.getIconClass(this.file_name.split('.')[this.file_name.split('.').length -1]) + '"></span><a href="#" title="' + this.file_name + '" >' + this.file_name + '</a></li>';
		});

		menu += '    </ul>' +
				'	<ul>' +
				'		<li class="currSegment" data-segment="' + UI.currentSegmentId + '"><a href="#">Go to current segment</a></li>' +
				'    </ul>' +
				'</nav>';
		this.body.append(menu); 
/*
		$('#jobMenu li').each(function() {
			APP.fitText($(this), $('a', $(this)), 20);
		});
*/
	},
	displaySurvey: function(s) {
		if(this.surveyDisplayed) return;
		survey = '<div class="modal survey" data-type="view">' +
				'	<div class="popup-outer"></div>' +
				'	<div class="popup">' +
				'		<a href="#" class="x-popup"></a>' +
				'		<h1>Translation Completed - Take a Survey</h1>' +
				'		<div class="popup-box">' +
				'			<iframe src="' + s + '" width="100%" height="670" frameborder="0" marginheight="0" marginwidth="0">Loading ...</iframe>' +
				'		</div>' +
				'	</div>' +
				'</div>';	
		this.body.append(survey);
		$('.modal.survey').show();
	},
	surveyAlreadyDisplayed: function() {
		if(typeof $.cookie('surveyedJobs') != 'undefined') {
			var c = $.cookie('surveyedJobs');
			surv = c.split('||')[0];
			if(config.survey === surv) {
				jobs = $.cookie('surveyedJobs').split('||')[1].split(',');
				var found = false;
				$.each(jobs, function(index) {
					if(this == config.job_id) {
						found = true;
					}
				});
				return found;
			}
		} else {
			return false;
		}
	},
	getIconClass: function(ext) {
		c =		(
					(ext == 'doc')||
					(ext == 'dot')||
					(ext == 'docx')||
					(ext == 'dotx')||
					(ext == 'docm')||
					(ext == 'dotm')||
					(ext == 'odt')||
					(ext == 'sxw')
				)?				'extdoc' :
				(
					(ext == 'pot')||
					(ext == 'pps')||
					(ext == 'ppt')||
					(ext == 'potm')||
					(ext == 'potx')||
					(ext == 'ppsm')||
					(ext == 'ppsx')||
					(ext == 'pptm')||
					(ext == 'pptx')||
					(ext == 'odp')||
					(ext == 'sxi')
				)?				'extppt' :
				(
					(ext == 'htm')||
					(ext == 'html')
				)?				'exthtm' :
				(ext == 'pdf')?		'extpdf' :
				(
					(ext == 'xls')||
					(ext == 'xlt')||
					(ext == 'xlsm')||
					(ext == 'xlsx')||
					(ext == 'xltx')||
					(ext == 'ods')||
					(ext == 'sxc')||
					(ext == 'csv')
				)?				'extxls' :
				(ext == 'txt')?		'exttxt' :
				(ext == 'ttx')?		'extttx' :
				(ext == 'itd')?		'extitd' :
				(ext == 'xlf')?		'extxlf' :
				(ext == 'mif')?		'extmif' :
				(ext == 'idml')?	'extidd' :
				(ext == 'xtg')?		'extqxp' :
				(ext == 'xml')?		'extxml' :
				(ext == 'rc')?		'extrcc' :
				(ext == 'resx')?		'extres' :
				(ext == 'sgml')?	'extsgl' :
				(ext == 'sgm')?		'extsgm' :
				(ext == 'properties')? 'extpro' :				
								'extxif';
		return c;		
	},
	createStatusMenu: function(statusMenu) {
		$("ul.statusmenu").empty().hide();
		var menu = '<li class="arrow"><span class="arrow-mcolor"></span></li><li><a href="#" class="f" data-sid="segment-' + this.currentSegmentId + '" title="set draft as status">DRAFT</a></li><li><a href="#" class="d" data-sid="segment-' + this.currentSegmentId + '" title="set translated as status">TRANSLATED</a></li><li><a href="#" class="a" data-sid="segment-' + this.currentSegmentId + '" title="set approved as status">APPROVED</a></li><li><a href="#" class="r" data-sid="segment-' + this.currentSegmentId + '" title="set rejected as status">REJECTED</a></li>';
		statusMenu.html(menu).show();
	},
	deActivateSegment: function(byButton) {
		this.removeButtons(byButton);
		this.removeHeader(byButton);
		this.removeFooter(byButton);
	},
	detectAdjacentSegment: function(segment, direction, times) { // currently unused
		if (!times)
			times = 1;
		if (direction == 'down') {
			adjacent = segment.next();
			if (!adjacent.is('section'))
				adjacent = this.currentFile.next().find('section:first');
		} else {
			adjacent = segment.prev();
			if (!adjacent.is('section'))
				adjacent = $('.editor').parents('article').prev().find('section:last');
		}

		if (adjacent.length) {
			if (times == 1) {
				return adjacent;
			} else {
				this.detectAdjacentSegment(adjacent, direction, times - 1);
			}
		} else {
		}
	},
	detectFirstLast: function() {
		var s = $('section');
		this.firstSegment = s.first();
		this.lastSegment = s.last();
	},
	setSegmentPointer: function() {
		if ($('.editor').length) {
			if ($('.editor').isOnScreen()) {
				$('#segmentPointer').hide();
			} else {
				if ($(window).scrollTop() > $('.editor').offset().top) {
					$('#segmentPointer').removeClass('down').css('margin-top', '-10px').addClass('up').show();
				} else {
					$('#segmentPointer').removeClass('up').addClass('down').css('margin-top', ($(window).height() - 140) + 'px').show();
				}
			}
		}
	},
	detectRefSegId: function(where) {
		var step = this.moreSegNum;
		var seg = (where == 'after') ? $('section').last() : (where == 'before') ? $('section').first() : '';
		var segId = (seg.length) ? seg.attr('id').split('-')[1] : 0;
		return segId;
	},
	detectStartSegment: function() {
		if (this.segmentToScrollAtRender) {
			this.startSegmentId = this.segmentToScrollAtRender;
		} else {
			var hash = window.location.hash.substr(1);
			this.startSegmentId = (hash) ? hash : config.last_opened_segment;
		}
	},
// temp
//	enableSearch: function() {
//		$('#filterSwitch').show();
//		this.searchEnabled = true;
//	},

	nextUnloadedResultSegment: function() {
		var found = '';
		var last = $('section').last().attr('id').split('-')[1];
		$.each(this.searchResultsSegments, function() {
//            var start = new Date().getTime();
//            for (var i = 0; i < 1e7; i++) {
//                if ((new Date().getTime() - start) > 2000 ){
//                    break;
//                }
//            }

			//controlla che il segmento non sia nell'area visualizzata?
			if ((!$('#segment-' + this).length) && (parseInt(this) > parseInt(last))) {
				found = parseInt(this);
				return false;
			}
		});
		if (found === '') {
			found = this.searchResultsSegments[0];
		}
		return found;
	},
	footerMessage: function(msg, segment) {
		$('.footer-message', segment).remove();
		$('.submenu', segment).append('<li class="footer-message">' + msg + '</div>');
		$('.footer-message', segment).fadeOut(6000);	
	},
	getMoreSegments: function(where) {
		if ((where == 'after') && (this.noMoreSegmentsAfter))
			return;
		if ((where == 'before') && (this.noMoreSegmentsBefore))
			return;
		if (this.loadingMore) {
			return;
		}
		this.loadingMore = true;

		var segId = this.detectRefSegId(where);

		if (where == 'before') {
			$("section").each(function() {
				if ($(this).offset().top > $(window).scrollTop()) {
					UI.segMoving = $(this).attr('id').split('-')[1];
					return false;
				}
			});
		}

		if (where == 'before') {
			$('#outer').addClass('loadingBefore');
		} else if (where == 'after') {
			$('#outer').addClass('loading');
		}

		APP.doRequest({
			data: {
				action: 'getSegments',
				jid: config.job_id,
				password: config.password,
				step: 50,
				segment: segId,
				where: where
			},
			success: function(d) {
				UI.getMoreSegments_success(d);
			}
		});
	},
	getMoreSegments_success: function(d) {
		if (d.error.length)
			this.processErrors(d.error, 'getMoreSegments');
		where = d.data.where;
		if (typeof d.data.files != 'undefined') {
			firstSeg = $('section').first();
			lastSeg = $('section').last();
			var numsegToAdd = 0;
			$.each(d.data.files, function() {
				numsegToAdd = numsegToAdd + this.segments.length;
			});
			this.renderSegments(d.data.files, where, false);

			// if getting segments before, UI points to the segment triggering the event 
			if ((where == 'before') && (numsegToAdd)) {
				this.scrollSegment($('#segment-' + this.segMoving));
			}
			if (this.body.hasClass('searchActive')) {
				segLimit = (where == 'before') ? firstSeg : lastSeg;
				this.markSearchResults({
					where: where,
					seg: segLimit
				});
			} else {
				this.markTags();
			}

		}
		if (where == 'after') {
		}
		if (d.data.files.length === 0) {
			if (where == 'after')
				this.noMoreSegmentsAfter = true;
			if (where == 'before')
				this.noMoreSegmentsBefore = true;
		}
		$('#outer').removeClass('loading loadingBefore');
		this.loadingMore = false;
		this.setWaypoints();
	},
	getNextSegment: function(segment, status) {
		var seg = this.currentSegment;

		var rules = (status == 'untranslated') ? 'section.status-draft:not(.readonly), section.status-rejected:not(.readonly), section.status-new:not(.readonly)' : 'section.status-' + status + ':not(.readonly)';
		var n = $(seg).nextAll(rules).first();
		if (!n.length) {
			n = $(seg).parents('article').next().find(rules).first();
		}
		if (n.length) {
			this.nextUntranslatedSegmentId = $(n).attr('id').split('-')[1];
		} else if ((UI.nextUntranslatedSegmentIdByServer) && (!UI.noMoreSegmentsAfter)) {
			this.nextUntranslatedSegmentId = UI.nextUntranslatedSegmentIdByServer;
		} else {
			this.nextUntranslatedSegmentId = 0;
		}

		var i = $(seg).next();
		if (!i.length) {
			i = $(seg).parents('article').next().find('section').first();
		}
		if (i.length) {
			this.nextSegmentId = $(i).attr('id').split('-')[1];
		} else {
			this.nextSegmentId = 0;
		}
	},
	getPercentuageClass: function(match) {
		var percentageClass = "";
		m_parse = parseInt(match);
		if (!isNaN(m_parse)) {
			match = m_parse;
		}

		switch (true) {
			case (match == 100):
				percentageClass = "per-green";
				break;
			case (match == 101):
				percentageClass = "per-blue";
				break;
			case(match > 0 && match <= 99):
				percentageClass = "per-orange";
				break;
			case (match == "MT"):
				percentageClass = "per-yellow";
				break;
			default :
				percentageClass = "";
		}
		return percentageClass;
	},
	getSegments: function(options) {
		where = (this.startSegmentId) ? 'center' : 'after';
		var step = this.initSegNum;
		$('#outer').addClass('loading');
		var seg = (options.segmentToScroll) ? options.segmentToScroll : this.startSegmentId;

		APP.doRequest({
			data: {
				action: 'getSegments',
				jid: config.job_id,
				password: config.password,
				step: step,
				segment: seg,
				where: where
			},
			success: function(d) {
				UI.getSegments_success(d, options);
			}
		});
	},
	getSegments_success: function(d, options) {
		if (d.error.length)
			this.processErrors(d.error, 'getSegments');
		where = d.data.where;
		$.each(d.data.files, function() {
			startSegmentId = this.segments[0].sid;
		});
		if (typeof this.startSegmentId == 'undefined')
			this.startSegmentId = startSegmentId;
		this.body.addClass('loaded');
		if (typeof d.data.files != 'undefined') {
			this.renderSegments(d.data.files, where, this.firstLoad);
			if ((options.openCurrentSegmentAfter) && (!options.segmentToScroll) && (!options.segmentToOpen)) {
				seg = (UI.firstLoad) ? this.currentSegmentId : UI.startSegmentId;
				this.gotoSegment(seg);
			}
			if (options.segmentToScroll) {
//                seg = (UI.firstLoad)? this.currentSegmentId : UI.startSegmentId;
				this.scrollSegment($('#segment-' + options.segmentToScroll));
			}
			if (options.segmentToOpen) {
				$('#segment-' + options.segmentToOpen + ' .editarea').click();
			}
			if (($('#segment-' + UI.currentSegmentId).length) && (!$('section.editor').length)) {
//				console.log('a');
				UI.openSegment(UI.editarea);
			}
			if (options.caller == 'link2file') {
				if (UI.segmentIsLoaded(UI.currentSegmentId)) {
					UI.openSegment(UI.editarea);
				}
			}

			if ($('#segment-' + UI.startSegmentId).hasClass('readonly')) {
				this.scrollSegment($('#segment-' + UI.startSegmentId));
			}

			if (options.applySearch) {
				$('mark.currSearchItem').removeClass('currSearchItem');
				this.markSearchResults();
				if (this.searchMode == 'normal') {
					$('#segment-' + options.segmentToScroll + ' mark.searchMarker').first().addClass('currSearchItem');
//				} else if (this.searchMode == 'source&target') {
//					$('#segment-' + options.segmentToScroll).addClass('currSearchSegment');
				} else {
					$('#segment-' + options.segmentToScroll + ' .editarea mark.searchMarker').first().addClass('currSearchItem');
//					$('#segment-' + options.segmentToScroll).addClass('currSearchSegment');
				}
			}
		}
		$('#outer').removeClass('loading loadingBefore');
		this.loadingMore = false;
		this.setWaypoints();
		this.markTags();
	},
	getSegmentSource: function(seg) {
		segment = (typeof seg == 'undefined') ? this.currentSegment : seg;
		return $('.source', segment).text();
	},
	getStatus: function(segment) {
		status = ($(segment).hasClass('status-new') ? 'new' : $(segment).hasClass('status-draft') ? 'draft' : $(segment).hasClass('status-translated') ? 'translated' : $(segment).hasClass('status-approved') ? 'approved' : 'rejected');
		return status;
	},
	getSegmentTarget: function(seg) {
		editarea = (typeof seg == 'undefined') ? this.editarea : $('.editarea', seg);
		return editarea.text();
	},
	getUpdates: function() {
		if (UI.chunkedSegmentsLoaded()) {
			lastUpdateRequested = UI.lastUpdateRequested;
			UI.lastUpdateRequested = new Date();
			APP.doRequest({
				data: {
					action: 'getUpdatedTranslations',
					last_timestamp: lastUpdateRequested.getTime(),
					first_segment: $('section').first().attr('id').split('-')[1],
					last_segment: $('section').last().attr('id').split('-')[1]
				},
				success: function(d) {
					UI.lastUpdateRequested = new Date();
					UI.updateSegments(d.data);
				}
			});
		}

		setTimeout(function() {
			UI.getUpdates();
		}, UI.checkUpdatesEvery);
	},
	updateSegments: function(segments) {
		$.each(segments, function() {
			seg = $('#segment-' + this.sid);
			$('.editarea, .area', seg).text(this.translation);
//			if (UI.body.hasClass('searchActive'))
//				UI.markSearchResults({
//					singleSegment: segment,
//					where: 'no'
//				})
			status = (this.status == 'DRAFT') ? 'draft' : (this.status == 'TRANSLATED') ? 'translated' : (this.status == 'APPROVED') ? 'approved' : (this.status == 'REJECTED') ? 'rejected' : '';
			UI.setStatus(seg, status);
		});
	},
	test: function(params) {
		console.log('params: ', params);
		console.log('giusto');
	},
	gotoNextSegment: function() {
		var next = $('.editor').next();
		if (next.is('section')) {
			this.scrollSegment(next);
			$('.editarea', next).trigger("click", "moving");
		} else {
			next = this.currentFile.next().find('section:first');
			if (next.length) {
				this.scrollSegment(next);
				$('.editarea', next).trigger("click", "moving");
			}
		}
	},
	gotoOpenSegment: function() {
		if ($('#segment-' + this.currentSegmentId).length) {
			this.scrollSegment(this.currentSegment);
		} else {
			$('#outer').empty();
			this.render({
				firstLoad: false,
				segmentToOpen: this.currentSegmentId
			});
		}
		$(window).trigger({
			type: "scrolledToOpenSegment",
			segment: segment
		});
	},
	gotoPreviousSegment: function() {
		var prev = $('.editor').prev();
		if (prev.is('section')) {
			$('.editarea', prev).click();
		} else {
			prev = $('.editor').parents('article').prev().find('section:last');
			if (prev.length) {
				$('.editarea', prev).click();
			} else {
				this.topReached();
			}
		}
		if (prev.length)
			this.scrollSegment(prev);
	},
	gotoSegment: function(id) {
		var el = $("#segment-" + id + "-target").find(".editarea");
		$(el).click();
	},
	initSegmentNavBar: function() {
		if (config.firstSegmentOfFiles.length == 1) {
			$('#segmentNavBar .prevfile, #segmentNavBar .nextfile').addClass('disabled');
		}
	},
	justSelecting: function(what) {
		if (window.getSelection().isCollapsed)
			return false;
		var selContainer = $(window.getSelection().getRangeAt(0).startContainer.parentNode);
		console.log(selContainer);
		if (what == 'editarea') {
			return ((selContainer.hasClass('editarea')) && (!selContainer.is(UI.editarea)));
		} else if (what == 'readonly') {
			return ((selContainer.hasClass('area')) || (selContainer.hasClass('source')));
		}
	},
	closeInplaceEditor: function(ed) {
		$(ed).removeClass('editing');
		$(ed).attr('contenteditable', false);
		$('.graysmall .edit-buttons').remove();
	},
	openInplaceEditor: function(ed) {
		$('.graysmall .translation.editing').each(function() {
			UI.closeInplaceEditor($(this));
		});
		$(ed).addClass('editing').attr('contenteditable', true).after('<span class="edit-buttons"><button class="cancel">Cancel</button><button class="save">Save</button></span>');
		$(ed).focus();
	},
	millisecondsToTime: function(milli) {
		var milliseconds = milli % 1000;
		var seconds = Math.round((milli / 1000) % 60);
		var minutes = Math.floor((milli / (60 * 1000)) % 60);
		return [minutes, seconds];
	},
	closeContextMenu: function() {
		$('#contextMenu').hide();
		$('#spellCheck .words').remove();
	},
	openSegment: function(editarea, operation) {
		var segment = $('#segment-' + $(editarea).attr('data-sid'));
		this.openSegmentStart = new Date();
		if (!this.byButton) {
			if (this.justSelecting('editarea'))
				return;
		}
		this.numOpenedSegments++;
		this.firstOpenedSegment = (this.firstOpenedSegment === 0) ? 1 : 2;
		this.byButton = false;
		this.cacheObjects(editarea);
		this.updateJobMenu();
		$(window).trigger({
			type: "segmentOpened",
			segment: segment
		});

		this.clearUndoStack();
		this.saveInUndoStack('open');
		this.autoSave = true;
		this.activateSegment();
		this.getNextSegment(this.currentSegment, 'untranslated');
		this.setCurrentSegment(segment);
		this.currentSegment.addClass('opened');

		this.currentSegment.attr('data-searchItems', ($('mark.searchMarker', this.editarea).length));

		this.fillCurrentSegmentWarnings(this.globalWarnings, true);
		this.setNextWarnedSegment();

		this.focusEditarea = setTimeout(function() {
			UI.editarea.focus();
			clearTimeout(UI.focusEditarea);
		}, 100);
		this.currentIsLoaded = false;
		this.nextIsLoaded = false;
		if (!this.readonly)
			this.getContribution(segment, 0);
			if(!this.noGlossary) this.getGlossary(segment, true, 0);
		this.opening = true;
		if (!(this.currentSegment.is(this.lastOpenedSegment))) {
			var lastOpened = $(this.lastOpenedSegment).attr('id');
			if (lastOpened != 'segment-' + this.currentSegmentId)
				this.closeSegment(this.lastOpenedSegment, 0, operation);
		}
		this.opening = false;
		this.body.addClass('editing');

		segment.addClass("editor");
		if (!this.readonly)
			this.editarea.attr('contenteditable', 'true');
		this.editStart = new Date();
		$(editarea).removeClass("indent");

		this.lockTags();
		if (!this.readonly) {
			this.getContribution(segment, 1);
			this.getContribution(segment, 2);
			if(!this.noGlossary) this.getGlossary(segment, true, 1);
			if(!this.noGlossary) this.getGlossary(segment, true, 2);
		}
		if (this.debug)
			console.log('close/open time: ' + ((new Date()) - this.openSegmentStart));
	},
	placeCaretAtEnd: function(el) {
//		console.log(el);
//		console.log($(el).first().get().className);
//		var range = document.createRange();
//		var sel = window.getSelection();
//		range.setStart(el, 1);
//		range.collapse(true);
//		sel.removeAllRanges();
//		sel.addRange(range);
//		el.focus();
		
		 $(el).focus();
		 if (typeof window.getSelection != "undefined" && typeof document.createRange != "undefined") {
			var range = document.createRange();
			range.selectNodeContents(el);
			range.collapse(false);
			var sel = window.getSelection();
			sel.removeAllRanges();
			sel.addRange(range);
		 } else if (typeof document.body.createTextRange != "undefined") {
			var textRange = document.body.createTextRange();
			textRange.moveToElementText(el);
			textRange.collapse(false);
			textRange.select();
		 }
		
	},
	registerQACheck: function() {
		clearTimeout(UI.pendingQACheck);
		UI.pendingQACheck = setTimeout(function() {
			UI.currentSegmentQA();
		}, config.segmentQACheckInterval);
	},
	reloadToSegment: function(segmentId) {
		this.infiniteScroll = false;
		config.last_opened_segment = segmentId;
		window.location.hash = segmentId;
		$('#outer').empty();
		this.render({
			firstLoad: false
		});
	},
	renderUntranslatedOutOfView: function() {
		this.infiniteScroll = false;
		config.last_opened_segment = this.nextUntranslatedSegmentId;
		window.location.hash = this.nextUntranslatedSegmentId;
		$('#outer').empty();
		this.render({
			firstLoad: false
		});
	},
	reloadWarning: function() {
		this.renderUntranslatedOutOfView();
//        APP.confirm({msg: 'The next untranslated segment is outside the current view.', callback: 'renderUntranslatedOutOfView' });
	},
	pointBackToSegment: function(segmentId) {
		if (!this.infiniteScroll)
			return;
		if (segmentId === '') {
			this.startSegmentId = config.last_opened_segment;
			$('#outer').empty();
			this.render({
				firstLoad: false
			});
		} else {
			$('#outer').empty();
			this.render({
				firstLoad: false
			});
		}
	},
	pointToOpenSegment: function() {
		this.gotoOpenSegment();
	},
	removeButtons: function(byButton) {
		var segment = (byButton) ? this.currentSegment : this.lastOpenedSegment;
		$('#' + segment.attr('id') + '-buttons').empty();
		$('p.warnings', segment).remove();
	},
	removeFooter: function(byButton) {
	},
	removeHeader: function(byButton) {
		var segment = (byButton) ? this.currentSegment : this.lastOpenedSegment;
		$('#' + segment.attr('id') + '-header').empty();
	},
	removeStatusMenu: function(statusMenu) {
		statusMenu.empty().hide();
	},
	renderSegments: function(files, where, starting) {
		$.each(files, function(k, v) {
			var newFile = '';
			var fs = this.file_stats;
//            var fid = fs['ID_FILE'];
			var fid = k;
			var articleToAdd = ((where == 'center') || (!$('#file-' + fid).length)) ? true : false;

			if (articleToAdd) {
				filenametoshow = truncate_filename(this.filename, 40);
				newFile += '<article id="file-' + fid + '" class="loading">' +
						'	<ul class="projectbar" data-job="job-' + this.jid + '">' +
						'		<li class="filename">' +
						'			<form class="download" action="/" method="post">' +
						'				<input type=hidden name="action" value="downloadFile">' +
						'				<input type=hidden name="id_job" value="' + this.jid + '">' +
						'				<input type=hidden name="id_file" value="' + fid + '">' +
						'				<input type=hidden name="filename" value="' + this.filename + '">' +
						'				<input type=hidden name="password" value="' + config.password + '">' +
						'				<!--input title="Download file" type="submit" value="" class="downloadfile" id="file-' + fid + '-download" -->' +
						'			</form>' +
						'			<h2 title="' + this.filename + '">' + filenametoshow + '</div>' +
						'		</li>' +
						'		<li style="text-align:center;text-indent:-20px">' +
						'			<strong>' + this.source + '</strong> [<span class="source-lang">' + this.source_code + '</span>]&nbsp;>&nbsp;<strong>' + this.target + '</strong> [<span class="target-lang">' + this.target_code + '</span>]' +
						'		</li>' +
						'		<li class="wordcounter">' +
						'			Payable Words: <strong>' + fs.TOTAL_FORMATTED + '</strong>' +
//                '			To-do: <strong>' + fs['DRAFT_FORMATTED'] + '</strong>'+
						'			<span id="rejected" class="hidden">Rejected: <strong>' + fs.REJECTED_FORMATTED + '</strong></span>' +
						'		</li>' +
						'	</ul>';
			}

			var t = config.time_to_edit_enabled;
			$.each(this.segments, function(index) {
//                this.readonly = true;
				var readonly = (this.readonly == 'true') ? true : false;
				var escapedSegment = htmlEncode(this.segment.replace(/\"/g, "&quot;"));

                /* this is to show line feed in source too, because server side we replace \n with placeholders */
                escapedSegment = escapedSegment.replace( config.lfPlaceholderRegex, "\n" );
                escapedSegment = escapedSegment.replace( config.crPlaceholderRegex, "\r" );
                escapedSegment = escapedSegment.replace( config.crlfPlaceholderRegex, "\r\n" );
                /* see also replacement made in source content below */
                /* this is to show line feed in source too, because server side we replace \n with placeholders */

				newFile += '<section id="segment-' + this.sid + '" class="' + ((readonly) ? 'readonly ' : '') + 'status-' + ((!this.status) ? 'new' : this.status.toLowerCase()) + ((this.has_reference == 'true')? ' has-reference' : '') + '">' +
						'	<a tabindex="-1" href="#' + this.sid + '"></a>' +
						'	<span class="sid">' + this.sid + '</span>' +
						'	<div class="body">' +
						'		<div class="header toggle" id="segment-' + this.sid + '-header">' +
//						'			<h2 title="" class="percentuage"><span></span></h2>' + 
//						'			<a href="#" id="segment-' + this.sid + '-close" class="close" title="Close this segment"></a>' +
//						'			<a href="#" id="segment-' + this.sid + '-context" class="context" title="Open context" target="_blank">Context</a>' +
						'		</div>' +
						'		<div class="text">' +
						'			<div class="wrap">' +               /* this is to show line feed in source too, because server side we replace \n with placeholders */
						'				<div class="outersource"><div class="source item" tabindex="0" id="segment-' + this.sid + '-source" data-original="' + escapedSegment + '">' + UI.decodePlaceholdersToText(this.segment) + '</div>' +
						'				<div class="copy" title="Copy source to target">' +
						'                   <a href="#"></a>' +
						'                   <p>' + ((UI.isMac) ? 'CMD' : 'CTRL') + '+RIGHT</p>' +
						'				</div>' +
						'				<div class="target item" id="segment-' + this.sid + '-target">' +
						'					<span class="hide toggle"> ' +
						'						<a href="#" class="warning normalTip exampleTip" title="Warning: as">!</a>' +
						'					</span>' +
						'					<div class="textarea-container">' +
						'						<span class="loader"></span>' +
						'						<div class="' + ((readonly) ? 'area' : 'editarea') + ' invisible" ' + ((readonly) ? '' : 'contenteditable="false" ') + 'spellcheck="true" lang="' + config.target_lang.toLowerCase() + '" id="segment-' + this.sid + '-editarea" data-sid="' + this.sid + '">' + ((!this.translation) ? '' : UI.decodePlaceholdersToText(this.translation)) + '</div>' +
						'						<p class="save-warning" title="Segment modified but not saved"></p>' +
						'					</div> <!-- .textarea-container -->' +
						'				</div> <!-- .target -->' +
						'			</div></div> <!-- .wrap -->' +
						'						<ul class="buttons toggle" id="segment-' + this.sid + '-buttons"></ul>' +
						'			<div class="status-container">' +
						'				<a href=# title="' + ((!this.status) ? 'Change segment status' : this.status.toLowerCase() + ', click to change it') + '" class="status" id="segment-' + this.sid + '-changestatus"></a>' +
						'			</div> <!-- .status-container -->' +
						'		</div> <!-- .text -->' +
						'		<div class="timetoedit" data-raw_time_to_edit="' + this.time_to_edit + '">' +
						((t) ? '			<span class=edit-min>' + this.parsed_time_to_edit[1] + '</span>m:' : '') +
						((t) ? '			<span class=edit-sec>' + this.parsed_time_to_edit[2] + '</span>s' : '') +
						'		</div>' +
						'		<div class="footer toggle"></div> <!-- .footer -->     ' +
						'	</div> <!-- .body -->' +
						'	<ul class="statusmenu"></ul>' +
						'</section> ';
			});

			if (articleToAdd) {
				newFile += '</article>';
			}

			if (articleToAdd) {
				if (where == 'before') {
					if (typeof lastArticleAdded != 'undefined') {
						$('#file-' + fid).after(newFile);
					} else {
						$('article').first().before(newFile);
					}
					lastArticleAdded = fid;
				} else if (where == 'after') {
					$('article').last().after(newFile);
				} else if (where == 'center') {
					$('#outer').append(newFile);
				}
			} else {
				if (where == 'before') {
					$('#file-' + fid).prepend(newFile);
				} else if (where == 'after') {
					$('#file-' + fid).append(newFile);
				}
			}
		});
		if (starting) {
			this.init();
		}
	},
	saveSegment: function(segment) {
		var status = (segment.hasClass('status-translated')) ? 'translated' : (segment.hasClass('status-approved')) ? 'approved' : (segment.hasClass('status-rejected')) ? 'rejected' : (segment.hasClass('status-new')) ? 'new' : 'draft';
		if (status == 'new') {
			status = 'draft';
		}
		console.log('SAVE SEGMENT');
		this.setTranslation(segment, status, 'autosave');
		segment.addClass('saved');
	},
	renderAndScrollToSegment: function(sid, file) {
		$('#outer').empty();
		this.render({
			firstLoad: false,
			caller: 'link2file',
			segmentToScroll: sid,
			scrollToFile: true
		});
//        this.render(false, segment.selector.split('-')[1]);
	},
	scrollSegment: function(segment) {
//		console.log(segment);
//        segment = (noOpen)? $('#segment-'+segment) : segment;
//        noOpen = (typeof noOpen == 'undefined')? false : noOpen;
		if (!segment.length) {
			$('#outer').empty();
			this.render({
				firstLoad: false,
				segmentToOpen: segment.selector.split('-')[1]
			});
		}
		var spread = 23;
		var current = this.currentSegment;
		var previousSegment = $(segment).prev('section');
//		console.log(previousSegment);

		if (!previousSegment.length) {
			previousSegment = $(segment);
			spread = 103;
		}
		var destination = "#" + previousSegment.attr('id');
		var destinationTop = $(destination).offset().top;
		if (this.firstScroll) {
			destinationTop = destinationTop + 100;
			this.firstScroll = false;
		}

		if ($(current).length) { // if there is an open segment
			if ($(segment).offset().top > $(current).offset().top) { // if segment to open is below the current segment
				if (!current.is($(segment).prev())) { // if segment to open is not the immediate follower of the current segment
					var diff = (this.firstLoad) ? ($(current).height() - 200 + 120) : 20;
					destinationTop = destinationTop - diff;
				} else { // if segment to open is the immediate follower of the current segment
					destinationTop = destinationTop - spread;
				}
			} else { // if segment to open is above the current segment
				destinationTop = destinationTop - spread;
			}
		} else { // if no segment is opened
			destinationTop = destinationTop - spread;
		}

		$("html,body").stop();
		$("html,body").animate({
			scrollTop: destinationTop - 20
		}, 500);
		setTimeout(function() {
			UI.goingToNext = false;
		}, 500);
	},
	segmentIsLoaded: function(segmentId) {
		if ($('#segment-' + segmentId).length) {
			return true;
		} else {
			return false;
		}
	},
	spellCheck: function(ed) {
		if (!UI.customSpellcheck)
			return false;
		editarea = (typeof ed == 'undefined') ? UI.editarea : $(ed);
		if ($('#contextMenu').css('display') == 'block')
			return true;

		APP.doRequest({
			data: {
				action: 'getSpellcheck',
				lang: config.target_rfc,
				sentence: UI.editarea.text()
			},
			context: editarea,
			success: function(data) {
				ed = this;
				$.each(data.result, function(key, value) { //key --> 0: { 'word': { 'offset':20, 'misses':['word1','word2'] } }

					var word = Object.keys(value)[0];
					replacements = value[word].misses.join(",");

					var Position = [
						parseInt(value[word].offset),
						parseInt(value[word].offset) + parseInt(word.length)
					];

					var sentTextInPosition = ed.text().substring(Position[0], Position[1]);
					//console.log(sentTextInPosition);

					var re = new RegExp("(\\b" + word + "\\b)", "gi");
					$(ed).html($(ed).html().replace(re, '<span class="misspelled" data-replacements="' + replacements + '">$1</span>'));
					// fix nested encapsulation
					$(ed).html($(ed).html().replace(/(<span class=\"misspelled\" data-replacements=\"(.*?)\"\>)(<span class=\"misspelled\" data-replacements=\"(.*?)\"\>)(.*?)(<\/span\>){2,}/gi, "$1$5</span>"));
//
//                    });
				});
			}
		});
	},
	addWord: function(word) {
		APP.doRequest({
			data: {
				action: 'setSpellcheck',
				slang: config.target_rfc,
				word: word
			},
			success: function(data) {

			}
		});
	},
	setCurrentSegment: function(segment, closed) {
		var id_segment = this.currentSegmentId;
		if (closed) {
			id_segment = 0;
			UI.currentSegment = undefined;
		} else {
			setTimeout(function() {
				var hash_value = window.location.hash;
				window.location.hash = UI.currentSegmentId;
			}, 300);
		}
		var file = this.currentFile;
		if (this.readonly)
			return;
		APP.doRequest({
			data: {
				action: 'setCurrentSegment',
				password: config.password,
				id_segment: id_segment,
				id_job: config.job_id
			},
			success: function(d) {
				UI.setCurrentSegment_success(d);
			}
		});
	},
	setCurrentSegment_success: function(d) {
		if (d.error.length)
			this.processErrors(d.error, 'setCurrentSegment');
		this.nextUntranslatedSegmentIdByServer = d.nextSegmentId;
//		this.nextUntranslatedSegmentIdByServer = d.nextUntranslatedSegmentId;
		this.getNextSegment(this.currentSegment, 'untranslated');
	},
	setDownloadStatus: function(stats) {
		var t = 'approved';
		if (parseFloat(stats.TRANSLATED))
			t = 'translated';
		if (parseFloat(stats.DRAFT))
			t = 'draft';
		if (parseFloat(stats.REJECTED))
			t = 'draft';
		$('.downloadtr-button').removeClass("draft translated approved").addClass(t);
		var label = (t == 'translated') ? 'DOWNLOAD TRANSLATION' : 'PREVIEW';
		$('#downloadProject').attr('value', label);
	},
	setProgress: function(stats) {
		var s = stats;
		m = $('footer .meter');
		var status = 'approved';
		var total = s.TOTAL;
		var t_perc = s.TRANSLATED_PERC;
		var a_perc = s.APPROVED_PERC;
		var d_perc = s.DRAFT_PERC;
		var r_perc = s.REJECTED_PERC;

		var t_perc_formatted = s.TRANSLATED_PERC_FORMATTED;
		var a_perc_formatted = s.APPROVED_PERC_FORMATTED;
		var d_perc_formatted = s.DRAFT_PERC_FORMATTED;
		var r_perc_formatted = s.REJECTED_PERC_FORMATTED;

		var d_formatted = s.DRAFT_FORMATTED;
		var r_formatted = s.REJECTED_FORMATTED;
		var t_formatted = s.TODO_FORMATTED;

		var wph = s.WORDS_PER_HOUR;
		var completion = s.ESTIMATED_COMPLETION;
		if (typeof wph == 'undefined') {
			$('#stat-wph').hide();
		} else {
			$('#stat-wph').show();
		}
		if (typeof completion == 'undefined') {
			$('#stat-completion').hide();
		} else {
			$('#stat-completion').show();
		}

		this.progress_perc = s.PROGRESS_PERC_FORMATTED;
		this.checkIfFinished();

		this.done_percentage = this.progress_perc;

		$('.approved-bar', m).css('width', a_perc + '%').attr('title', 'Approved ' + a_perc_formatted + '%');
		$('.translated-bar', m).css('width', t_perc + '%').attr('title', 'Translated ' + t_perc_formatted + '%');
		$('.draft-bar', m).css('width', d_perc + '%').attr('title', 'Draft ' + d_perc_formatted + '%');
		$('.rejected-bar', m).css('width', r_perc + '%').attr('title', 'Rejected ' + r_perc_formatted + '%');

		$('#stat-progress').html(this.progress_perc);

		$('#stat-todo strong').html(t_formatted);
		$('#stat-wph strong').html(wph);
		$('#stat-completion strong').html(completion);
	},
	chunkedSegmentsLoaded: function() {
		return $('section.readonly').length;
	},
	setStatus: function(segment, status) {
		segment.removeClass("status-draft status-translated status-approved status-rejected status-new").addClass("status-" + status);
	},
	setStatusButtons: function(button) {
		isTranslatedButton = ($(button).hasClass('translated')) ? true : false;
		this.editStop = new Date();
		var segment = this.currentSegment;
		tte = $('.timetoedit', segment);
		this.editTime = this.editStop - this.editStart;
		this.totalTime = this.editTime + tte.data('raw_time_to_edit');
		var editedTime = this.millisecondsToTime(this.totalTime);
		if (config.time_to_edit_enabled) {
			var editSec = $('.timetoedit .edit-sec', segment);
			var editMin = $('.timetoedit .edit-min', segment);
			editMin.text(this.zerofill(editedTime[0], 2));
			editSec.text(this.zerofill(editedTime[1], 2));
		}
		tte.data('raw_time_to_edit', this.totalTime);
		var statusSwitcher = $(".status", segment);
		statusSwitcher.removeClass("col-approved col-rejected col-done col-draft");

		var statusToGo = (isTranslatedButton) ? 'untranslated' : '';
		var nextUntranslatedSegment = $('#segment-' + this.nextUntranslatedSegmentId);
		this.nextUntranslatedSegment = nextUntranslatedSegment;
		if ((!isTranslatedButton) && (!nextUntranslatedSegment.length)) {
			$(".editor:visible").find(".close").trigger('click', 'Save');
			$('.downloadtr-button').focus();
			return false;
		}
		this.buttonClickStop = new Date();
		this.copyToNextIfSame(nextUntranslatedSegment);
		this.byButton = true;
	},
	collectSegmentErrors: function(segment) {
		var errors = '';
		// tag mismatch
		if (segment.hasClass('mismatch'))
			errors += '01|';
		return errors.substring(0, errors.length - 1);
	},
	goToFirstError: function() {
		location.href = $('#point2seg').attr('href');
	},
	continueDownload: function() {
		$("form#fileDownload").unbind().submit().bind('submit', function(e) {
			e.preventDefault();
		});
	},
	/**
	 * fill segments with relative errors from polling
	 * 
	 * @param {type} segment
	 * @param {type} warnings
	 * @returns {undefined}
	 */
	setNextWarnedSegment: function(sid) {
		sid = sid || UI.currentSegmentId;
		idList = UI.globalWarnings;
		$.each(idList, function(index) {
			if (this > sid) {
				$('#point2seg').attr('href', '#' + this);
				return false;
			}
			if (this == idList[idList.length - 1]) {
				$('#point2seg').attr('href', '#' + idList[0]);
			}
		});
	},
	fillWarnings: function(segment, warnings) {
		//console.log( 'fillWarnings' );
		//console.log( warnings);

		//add Warnings to current Segment
		var parentTag = segment.find('p.warnings').parent();
		var actualWarnings = segment.find('p.warnings');

		$.each(warnings, function(key, value) {
			//console.log(warnings[key]);
			parentTag.before(actualWarnings).append('<p class="warnings">' + value.debug + '</p>');
		});
		actualWarnings.remove();

	},
	/**
	 * Walk Warnings to fill right segment
	 * 
	 * @returns {undefined}
	 */
	fillCurrentSegmentWarnings: function(warningDetails, global) {
		if(global) {
//			$.each(warningDetails, function(key, value) {
//				console.log()
//				if ('segment-' + value.id_segment === UI.currentSegment[0].id) {
//					UI.fillWarnings(UI.currentSegment, $.parseJSON(value.warnings));
//				}
//			});			
		} else {
			UI.fillWarnings(UI.currentSegment, $.parseJSON(warningDetails.warnings));
		}

	},

	compareArrays: function(i1, i2) {
		$.each(i1, function(key,value) {
			t = value;
			$.each(i2, function(k,v) {
				if(t == v) {
					i1.splice(key, 1);
					i2.splice(k, 1);
					UI.compareArrays(i1, i2);
					return false;
				}
			});						
		});
		return i1;
	},

	checkWarnings: function(openingSegment) {
		var dd = new Date();
		ts = dd.getTime();
		var seg = (typeof this.currentSegmentId == 'undefined') ? this.startSegmentId : this.currentSegmentId;
		var token = seg + '-' + ts.toString();

		APP.doRequest({
			data: {
				action: 'getWarning',
				id_job: config.job_id,
				password: config.password,
				token: token
			},
			success: function(data) {
				var warningPosition = '';
//                console.log('data.total: '+data.total);
				UI.globalWarnings = data.details;

				//check for errors
				if (UI.globalWarnings.length > 0) {
					//for now, put only last in the pointer to segment id
					warningPosition = '#' + data.details[ Object.keys(data.details).sort().shift() ].id_segment;
//                    console.log('warningPosition: ' + warningPosition);

					if (openingSegment)
						UI.fillCurrentSegmentWarnings(data.details, true);
			
					//switch to css for warning
					$('#notifbox').attr('class', 'warningbox').attr("title", "Some translations seems to have TAGS and/or other untraslatables that do not match the source").find('.numbererror').text(UI.globalWarnings.length);

				} else {
					//if everything is ok, switch css to ok
					$('#notifbox').attr('class', 'notific').attr("title", "Well done, no errors found!").find('.numbererror').text('');
					//reset the pointer to offending segment
					$('#point2seg').attr('href', '#');
				}

				UI.setNextWarnedSegment();
//                $('#point2seg').attr('href', warningPosition);
			}
		});
	},
	currentSegmentQA: function() {
		this.currentSegment.addClass('waiting_for_check_result');
		var dd = new Date();
		ts = dd.getTime();
		var token = this.currentSegmentId + '-' + ts.toString();

		//var src_content = $('.source', this.currentSegment).attr('data-original');

        if( config.brPlaceholdEnabled ){
            src_content = this.postProcessEditarea(this.currentSegment, '.source');
            trg_content = this.postProcessEditarea(this.currentSegment);
        } else {
            src_content = this.getSegmentSource();
            trg_content = this.getSegmentTarget();
        }

		this.checkSegmentsArray[token] = trg_content;
		APP.doRequest({
			data: {
				action: 'getWarning',
				id: this.currentSegmentId,
				token: token,
				password: config.password,
				src_content: src_content,
				trg_content: trg_content
			},
			success: function(d) {
				if (UI.currentSegment.hasClass('waiting_for_check_result')) {

					// check conditions for results discard
					if (!d.total) {
						$('p.warnings', UI.currentSegment).empty();
						$('span.locked.mismatch', UI.currentSegment).removeClass('mismatch');
						return;
					}
					if (UI.editarea.text().trim() != UI.checkSegmentsArray[d.token].trim().replace(config.crlfPlaceholderRegex, ''))
						return;

					UI.fillCurrentSegmentWarnings(d.details, false); // update warnings
					UI.markTagMismatch(d.details);
					delete UI.checkSegmentsArray[d.token]; // delete the token from the tail
					UI.currentSegment.removeClass('waiting_for_check_result');
				}
			}
		}, 'local');
	},
	setTranslation: function(segment, status, caller) {
		caller = (typeof caller == 'undefined') ? false : caller;
//		console.log('SET TRANSLATION');
		var info = $(segment).attr('id').split('-');
		var id_segment = info[1];
		var file = $(segment).parents('article');
//		var status = status;

		// Attention, to be modified when we will lock tags
		if( config.brPlaceholdEnabled ) {
            translation = this.postProcessEditarea(segment);
        } else {
            translation = $('.editarea', segment ).text();
        }

		if (translation === '')
			return false;
		var time_to_edit = UI.editTime;
		var id_translator = config.id_translator;
		var errors = '';
		errors = this.collectSegmentErrors(segment);
		var chosen_suggestion = $('.editarea', segment).data('lastChosenSuggestion'); 
//		if(caller != 'replace') {
//			if(this.body.hasClass('searchActive')) {
//				console.log('aaa');
//				console.log(segment);
//				this.applySearch(segment);
//				oldNum = parseInt($(segment).attr('data-searchitems'));
//				newNum = parseInt($('mark.searchMarker', segment).length);
//				numRes = $('.search-display .numbers .results');
//				numRes.text(parseInt(numRes.text()) - oldNum + newNum);
//			}
//		}
		autosave = (caller == 'autosave') ? true : false;


		APP.doRequest({
			data: {
				action: 'setTranslation',
				id_segment: id_segment,
				id_job: config.job_id,
				id_first_file: file.attr('id').split('-')[1],
				password: config.password,
				status: status,
				translation: translation,
				time_to_edit: time_to_edit,
				id_translator: id_translator,
				errors: errors,
				chosen_suggestion_index: chosen_suggestion,
				autosave: autosave
			},
			success: function(d) {
				UI.setTranslation_success(d, segment, status);
			}
		});
	},
    /**
     * This function is used when a string has to be sent to the server
     * It works over a clone of the editarea ( translation area ) and manage the text()
     * @param segment
     * @returns {XML|string}
     */
//    getTranslationWithBrPlaceHolders: function(segment) {
//        return UI.getTextContentWithBrPlaceHolders( segment );
//    },
    /**
     * This function is used when a string has to be sent to the server
     * It works over a clone of the editarea ( source area ) and manage the text()
     * @param segment
     * @returns {XML|string}
     */
//    getSourceWithBrPlaceHolders: function(segment) {
//        return UI.getTextContentWithBrPlaceHolders( segment, '.source' );
//    },

    /**
     * Called when a translation is sent to the server
     *
     * This method get the translation edit area TEXT and place the right placeholders
     * after br tags
     *
     * @param context
     * @param selector
     * @returns {XML|string}
     */
/*
	fixBR: function(txt) {
		var ph = '<br class="' + config.crPlaceholderClass + '">';
		var re = new RegExp(ph + '$', "gi");
		return txt.replace(/<div><br><\/div>/g, ph).replace(/<div>/g, '<br class="' + config.crPlaceholderClass + '">').replace(/<\/div>/g, '').replace(/<br>/g, ph).replace(re, '');
//		return txt.replace(/<br>/g, '').replace(/<div>/g, '<br class="' + config.crPlaceholderClass + '">').replace(/<\/div>/g, '').replace(re, '');
	},
*/

	postProcessEditarea: function(context, selector){
		selector = (typeof selector === "undefined") ? '.editarea' : selector;
		area = $( selector, context ).clone();
/*
		console.log($(area).html());
		var txt = this.fixBR($(area).html());
		console.log(txt);
		return txt;
*/

		var divs = $( area ).find( 'div' );
		if( divs.length ){
			divs.each(function(){
				$(this).find( 'br:not([class])' ).remove();
				$(this).prepend( $('<span class="placeholder">' + config.crlfPlaceholder + '</span>' ) ).replaceWith( $(this).html() );
			});
		} else {
//			console.log('post process 1: ', $(area).html());
//			console.log($(area).find( 'br:not([class])' ).length);
//			$(area).find( 'br:not([class])' ).replaceWith( $('<span class="placeholder">' + config.crlfPlaceholder + '</span>') );
			$(area).find('br:not([class]), br.' + config.crlfPlaceholderClass).replaceWith( '<span class="placeholder">' + config.crlfPlaceholder + '</span>' );
//			$(area).find( 'br:not([class])' ).replaceWith( $('[BR]') );
//			console.log('post process 2: ', $(area).html());
		}

//        Now commented, but valid for future purposes when the user will choose what type of carriage return
//        $('br', area).each(function() {
//
//            try{
//                var br = this;
//                //split ensure array with at least 1 item or throws exception
//                var classes = $(br).attr('class').split(' ');
//                $(classes).each( function( index, value ){
//                    switch( value ){
//                        case config.lfPlaceholderClass:
//                            $(br).after('<span class="placeholder">' + config.lfPlaceholder + '</span>');
//                            break;
//                        case config.crPlaceholderClass:
//                            $(br).after('<span class="placeholder">' + config.crPlaceholder + '</span>');
//                            break;
//                        case config.crlfPlaceholderClass:
//                            $(br).after('<span class="placeholder">' + config.crlfPlaceholder + '</span>');
//                            break;
//                    }
//                });
//            } catch ( e ){
//                console.log( "Exception on placeholder replacement.\nAdded a default placeholder " + e.message );
//                //add a default placeholder, when a return is pressed by the user chrome add a simple <br>
//                //so
//                $(this).after('<span class="placeholder">' + config.crPlaceholder + '</span>');
//            }
//
//        });

		return area.text();



    },

    /**
     * Called when a Segment string returned by server has to be visualized, it replace placeholders with br tags
     * @param str
     * @returns {XML|string}
     */
    decodePlaceholdersToText: function ( str ) {
        var _str = str.replace( config.lfPlaceholderRegex, '<br class="' + config.lfPlaceholderClass +'" />' )
                      .replace( config.crPlaceholderRegex, '<br class="' + config.crPlaceholderClass +'" />' )
                      .replace( config.crlfPlaceholderRegex, '<br class="' + config.crlfPlaceholderClass +'" />' );
        return _str;
    },

	processErrors: function(err, operation) {
		$.each(err, function() {
			if (operation == 'setTranslation') {
				if (this.code != '-10') { // is not a password error
					APP.alert({msg: "Error in saving the translation. Try the following: <br />1) Refresh the page (Ctrl+F5 twice) <br />2) Clear the cache in the browser <br />If the solutions above does not resolve the issue, please stop the translation and report the problem to <b>support@matecat.com</b>"});
				}
			}

			if (operation == 'setContribution' && this.code != '-10') { // is not a password error
				APP.alert({msg: "Error in saving the translation memory.<br />Try the to save again the segment.<br />If the solutions above does not resolve the issue, please stop the translation and report the problem to <b>support@matecat.com</b>"});
			}

			if (this.code == '-10') {
//				APP.alert("Job canceled or assigned to another translator");
				APP.alert({
					msg: 'Job canceled or assigned to another translator', 
					callback: 'reloadPage' 
				});		
				//FIXME
				// This Alert, will be NEVER displayed because are no-blocking
				// Transform location.reload(); to a callable function passed as callback to alert
			}

		});
	},
	reloadPage: function() {
		console.log('reloadPage');
		location.reload();
	},

	someSegmentToSave: function() {
		res = ($('section.modified').length) ? true : false;
		return res;
	},
	setContextMenu: function() {
		var alt = (this.isMac) ? '&#x2325;' : 'Alt ';
		var cmd = (this.isMac) ? '&#8984;' : 'Ctrl ';
		$('#contextMenu .shortcut .alt').html(alt);
		$('#contextMenu .shortcut .cmd').html(cmd);
	},
	setTranslation_success: function(d, segment, status) {
		if (d.error.length)
			this.processErrors(d.error, 'setTranslation');
		if (d.data == 'OK') {
			this.setStatus(segment, status);
			this.setDownloadStatus(d.stats);
			this.setProgress(d.stats);
			//check status of global warnings
			this.checkWarnings(false);
		}
	},
	setWaypoints: function() {
		this.firstSegment.waypoint('remove');
		this.lastSegment.waypoint('remove');
		this.detectFirstLast();
		this.lastSegment.waypoint(function(event, direction) {
			if (direction === 'down') {
				UI.lastSegment.waypoint('remove');
				if (UI.infiniteScroll) {
					if (!UI.blockGetMoreSegments) {
						UI.blockGetMoreSegments = true;
						UI.getMoreSegments('after');
						setTimeout(function() {
							UI.blockGetMoreSegments = false;
						}, 1000);
					}
				}
			}
		}, UI.downOpts);

		this.firstSegment.waypoint(function(event, direction) {
			if (direction === 'up') {
				UI.firstSegment.waypoint('remove');
				UI.getMoreSegments('before');
			}
		}, UI.upOpts);
	},
	showContextMenu: function(str, ypos, xpos) {
		if (($('#contextMenu').width() + xpos) > $(window).width())
			xpos = $(window).width() - $('#contextMenu').width() - 30;
		$('#contextMenu').css({
			"top": (ypos + 13) + "px",
			"left": xpos + "px"
		}).show();
	},

	/*
	 // for future implementation
	 
	 getSegmentComments: function(segment) {
	 var id_segment = $(segment).attr('id').split('-')[1];
	 var id_translator = config.id_translator;
	 $.ajax({
	 url: config.basepath + '?action=getSegmentComment',
	 data: {
	 action: 'getSegmentComment',
	 id_segment: id_segment,
	 id_translator: id_translator
	 },
	 type: 'POST',
	 dataType: 'json',
	 context: segment,
	 success: function(d){
	 $('.numcomments',this).text(d.data.length);
	 $.each(d.data, function() {
	 $('.comment-area ul .newcomment',segment).before('<li><p><strong>'+this.author+'</strong><span class="date">'+this.date+'</span><br />'+this.text+'</p></li>');
	 });
	 }
	 });
	 },
	 
	 addSegmentComment: function(segment) {
	 var id_segment = $(segment).attr('id').split('-')[1];
	 var id_translator = config.id_translator;
	 var text = $('.newcomment textarea',segment).val();
	 $.ajax({
	 url: config.basepath + '?action=addSegmentComment',
	 data: {
	 action: 'addSegmentComment',
	 id_segment: id_segment,
	 id_translator: id_translator,
	 text: text
	 },
	 type: 'POST',
	 dataType: 'json',
	 success: function(d){
	 }
	 });
	 },
	 */

	topReached: function() {
//        var jumpto = $(this.currentSegment).offset().top;
//        $("html,body").animate({
//            scrollTop: 0
//        }, 200).animate({
//            scrollTop: jumpto - 50
//        }, 200);
	},
	browserScrollPositionRestoreCorrection: function() {
		// detect if the scroll is a browser generated scroll position restore, and if this is the case rescroll to the segment 
		if (this.firstOpenedSegment == 1) { // if the current segment is the first opened in the current UI  
			if (!$('.editor').isOnScreen()) { // if the current segment is out of the current viewport 
				if (this.autoscrollCorrectionEnabled) { // if this is the first correction and we are in the initial 2 seconds since page init 
					this.scrollSegment(this.currentSegment);
					this.autoscrollCorrectionEnabled = false;
				}
			}
		}
	},
	undoInSegment: function() {
		if (this.undoStackPosition === 0)
			this.saveInUndoStack('undo');
		var ind = 0;
		if (this.undoStack[this.undoStack.length - 1 - this.undoStackPosition - 1])
			ind = this.undoStack.length - 1 - this.undoStackPosition - 1;

		this.editarea.html(this.undoStack[ind]);
		if (!ind)
			this.lockTags();

		if (this.undoStackPosition < (this.undoStack.length - 1))
			this.undoStackPosition++;
		this.currentSegment.removeClass('waiting_for_check_result');
		this.registerQACheck();
	},
	redoInSegment: function() {
		this.editarea.html(this.undoStack[this.undoStack.length - 1 - this.undoStackPosition - 1 + 2]);
		if (this.undoStackPosition > 0)
			this.undoStackPosition--;
		this.currentSegment.removeClass('waiting_for_check_result');
		this.registerQACheck();
	},
	saveInUndoStack: function(action) {
		currentItem = this.undoStack[this.undoStack.length - 1 - this.undoStackPosition];

		if (typeof currentItem != 'undefined') {
			if (currentItem.trim() == this.editarea.html().trim())
				return;
		}

		if (this.editarea.html() === '')
			return;

		var ss = this.editarea.html().match(/<span.*?contenteditable\="false".*?\>/gi);
		var tt = this.editarea.html().match(/&lt;/gi);
		if (tt) {
			if ((tt.length) && (!ss))
				return;
		}

		var diff = (typeof currentItem != 'undefined') ? this.dmp.diff_main(currentItem, this.editarea.html())[1][1] : 'null';
		if (diff == ' selected')
			return;

		var pos = this.undoStackPosition;
		if (pos > 0) {
			this.undoStack.splice(this.undoStack.length - pos, pos);
			this.undoStackPosition = 0;
		}
		this.undoStack.push(this.editarea.html().replace(/(<.*?)\s?selected\s?(.*?\>)/gi, '$1$2'));
	},
	clearUndoStack: function() {
		this.undoStack = [];
	},
	updateJobMenu: function() {
		$('#jobMenu li.current').removeClass('current');
		$('#jobMenu li:not(.currSegment)').each(function(index) {
			if ($(this).attr('data-file') == UI.currentFileId)
				$(this).addClass('current');
		});
		$('#jobMenu li.currSegment').attr('data-segment', UI.currentSegmentId);
	},
	zerofill: function(i, l, s) {
		var o = i.toString();
		if (!s) {
			s = '0';
		}
		while (o.length < l) {
			o = s + o;
		}
		return o;
	}
};

$(document).ready(function() {

	APP.init();
	APP.fitText($('.breadcrumbs'), $('#pname'), 30);
	setBrowserHistoryBehavior();
	$("article").each(function() {
		APP.fitText($('.filename h2', $(this)), $('.filename h2', $(this)), 30);
	});
	UI.render({
		firstLoad: true
	});
	//launch segments check on opening
	UI.checkWarnings(true);
	//and on every polling interval
	setInterval(function() {
		UI.checkWarnings(false);
	}, config.warningPollingInterval);
});

$.extend($.expr[":"], {
	"containsNC": function(elem, i, match, array) {
		return (elem.textContent || elem.innerText || "").toLowerCase().indexOf((match[3] || "").toLowerCase()) >= 0;
	}
});

$(window).resize(function() {
});

