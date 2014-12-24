/*
	Component: ui.tags
 */
$.extend(UI, {
	noTagsInSegment: function(options) {
        editarea = options.area;
        starting = options.starting;
        if(starting) return false;

        if ($(editarea).html().match(/\&lt;.*?\&gt;/gi)) {
            return false;
        } else {
            return true;
        }
	},
	tagCompare: function(sourceTags, targetTags, prova) {

// removed, to be verified
//		if(!UI.currentSegment.hasClass('loaded')) return false;

		var mismatch = false;
		for (var i = 0; i < sourceTags.length; i++) {
			for (var index = 0; index < targetTags.length; index++) {
				if (sourceTags[i] == targetTags[index]) {
					sourceTags.splice(i, 1);
					targetTags.splice(index, 1);
					UI.tagCompare(sourceTags, targetTags, prova++);
				}
			}
		}
		if ((!sourceTags.length) && (!targetTags.length)) {
			mismatch = false;
		} else {
			mismatch = true;
		}
		return(mismatch);
	},
    disableTagMark: function() {
		this.taglockEnabled = false;
		this.body.addClass('tagmarkDisabled');
		$('.source span.locked').each(function() {
			$(this).replaceWith($(this).html());
		});
		$('.editarea span.locked').each(function() {
			$(this).replaceWith($(this).html());
		});
	},
	enableTagMark: function() {//console.log('enable tag mark');
		this.taglockEnabled = true;
		this.body.removeClass('tagmarkDisabled');
		saveSelection();
		this.markTags();
		restoreSelection();
	},
	markSuggestionTags: function(segment) {
		if (!this.taglockEnabled)
			return false;
		$('.footer .suggestion_source', segment).each(function() {
            $(this).html($(this).html().replace(/(&lt;[\/]*(g|x|bx|ex|bpt|ept|ph|it|mrk).*?&gt;)/gi, "<span contenteditable=\"false\" class=\"locked\">$1</span>"));
           // $(this).html($(this).html().replace(/(&lt;(g|x|bx|ex|bpt|ept|ph|it|mrk)\sid.*?&gt;)/gi, "<span contenteditable=\"false\" class=\"locked\">$1</span>"));
			if (UI.isFirefox) {
				$(this).html($(this).html().replace(/(<span class=\"(.*?locked.*?)\" contenteditable=\"false\"\>)(<span class=\"(.*?locked.*?)\" contenteditable=\"false\"\>)(.*?)(<\/span\>){2,}/gi, "$1$5</span>"));
			} else {
				$(this).html($(this).html().replace(/(<span contenteditable=\"false\" class=\"(.*?locked.*?)\"\>)(<span contenteditable=\"false\" class=\"(.*?locked.*?)\"\>)(.*?)(<\/span\>){2,}/gi, "$1$5</span>"));
			}
            UI.detectTagType(this);
        });
		$('.footer .translation').each(function() {
            $(this).html($(this).html().replace(/(&lt;[\/]*(g|x|bx|ex|bpt|ept|ph|it|mrk).*?&gt;)/gi, "<span contenteditable=\"false\" class=\"locked\">$1</span>"));
//			$(this).html($(this).html().replace(/(&lt;(g|x|bx|ex|bpt|ept|ph|it|mrk)\sid.*?&gt;)/gi, "<span contenteditable=\"false\" class=\"locked\">$1</span>"));
			if (UI.isFirefox) {
				$(this).html($(this).html().replace(/(<span class=\"(.*?locked.*?)\" contenteditable=\"false\"\>)(<span class=\"(.*?locked.*?)\" contenteditable=\"false\"\>)(.*?)(<\/span\>){2,}/gi, "$1$5</span>"));
			} else {
				$(this).html($(this).html().replace(/(<span contenteditable=\"false\" class=\"(.*?locked.*?)\"\>)(<span contenteditable=\"false\" class=\"(.*?locked.*?)\"\>)(.*?)(<\/span\>){2,}/gi, "$1$5</span>"));
			}
            UI.detectTagType(this);
        });

    },
	markTags: function() {
		if (!this.taglockEnabled) return false;
//		UI.checkHeaviness(); 

		if(this.noTagsInSegment({
            area: false,
            starting: true
        })) {
            return false;
        }

		$('.source, .editarea').each(function() {
			UI.lockTags(this);
		});
	},

	markTagsInSearch: function(el) {
		if (!this.taglockEnabled)
			return false;
		var elements = (typeof el == 'undefined') ? $('.editor .cc-search .input') : el;
		elements.each(function() {
//			UI.lockTags(this);
		});
	},

	// TAG LOCK
	lockTags: function(el) {
//		console.log('lock tags: ', UI.editarea.html());
		if (this.body.hasClass('tagmarkDisabled'))
			return false;
		editarea = (typeof el == 'undefined') ? UI.editarea : el;
        el = (typeof el == 'undefined') ? UI.editarea : el;
		if (!this.taglockEnabled)
			return false;
//        console.log('this.noTagsInSegment(): ', this.noTagsInSegment());
//		console.log('IL SEGMENTO: ', $('#segment-' + el.attr('data-sid')));
//        console.log('devo interrompere il lockTags?: ', this.noTagsInSegment($(el).parents('section').first()));
//        console.log('elemento: ', el);
        if (this.noTagsInSegment({
            area: el,
            starting: false
        }))
			return false;
//        console.log('$(editarea).first(): ', $(editarea).first());
        $(editarea).first().each(function() {
			saveSelection();
			var tx = $(this).html();
			brTx1 = (UI.isFirefox)? "<pl class=\"locked\" contenteditable=\"false\">$1</pl>" : "<pl contenteditable=\"false\" class=\"locked\">$1</pl>";
			brTx2 = (UI.isFirefox)? "<span class=\"locked\" contenteditable=\"false\">$1</span>" : "<span contenteditable=\"false\" class=\"locked\">$1</span>";
//			brTx1 = (UI.isFirefox)? "<pl class=\"locked\" contenteditable=\"true\">$1</pl>" : "<pl contenteditable=\"true\" class=\"locked\">$1</pl>";
//			brTx2 = (UI.isFirefox)? "<span class=\"locked\" contenteditable=\"true\">$1</span>" : "<span contenteditable=\"true\" class=\"locked\">$1</span>";
            tx = tx.replace(/<span/gi, "<pl")
                    .replace(/<\/span/gi, "</pl")
                    .replace(/&lt;/gi, "<")
                    .replace(/(<(g|x|bx|ex|bpt|ept|ph[^a-z]*|it|mrk)\sid[^<]*?&gt;)/gi, brTx1)
                    .replace(/</gi, "&lt;")
                    .replace(/\&lt;pl/gi, "<span")
                    .replace(/\&lt;\/pl/gi, "</span")
                    .replace(/\&lt;div\>/gi, "<div>")
                    .replace(/\&lt;\/div\>/gi, "</div>")
                    .replace(/\&lt;br\>/gi, "<br>")
                    .replace(/\&lt;br class=["\'](.*?)["\'][\s]*[\/]*(\&gt;|\>)/gi, '<br class="$1" />')
                    .replace(/(&lt;\s*\/\s*(g|x|bx|ex|bpt|ept|ph|it|mrk)\s*&gt;)/gi, brTx2);

            if (UI.isFirefox) {
                tx = tx.replace(/(<span class="[^"]*" contenteditable="false"\>)(:?<span class="[^"]*" contenteditable="false"\>)(.*?)(<\/span\>){2}/gi, "$1$3</span>");
//                tx = tx.replace(/(<span class="[^"]*" contenteditable="true"\>)(:?<span class="[^"]*" contenteditable="true"\>)(.*?)(<\/span\>){2}/gi, "$1$3</span>");
            } else {
                tx = tx.replace(/(<span contenteditable="false" class="[^"]*"\>)(:?<span contenteditable="false" class="[^"]*"\>)(.*?)(<\/span\>){2}/gi, "$1$3</span>");
//                tx = tx.replace(/(<span contenteditable="true" class="[^"]*"\>)(:?<span contenteditable="true" class="[^"]*"\>)(.*?)(<\/span\>){2}/gi, "$1$3</span>");
            }

//			if (UI.isFirefox) {
//				tx = tx.replace(/(<span class=\"(.*?locked.*?)\" contenteditable=\"false\"\>)(<span class=\"(.*?locked.*?)\" contenteditable=\"false\"\>)(.*?)(<\/span\>){2,}/gi, "$1$5</span>");
//				tx = tx.replace(/(<span class=\"(.*?locked.*?)\" contenteditable=\"false\"\>){2,}(.*?)(<\/span\>){2,}/gi, "<span class=\"$2\" contenteditable=\"false\">$3</span>");
//			} else {
//				// fix nested encapsulation
//				tx = tx.replace(/(<span contenteditable=\"true\" class=\"(.*?locked.*?)\"\>)(<span contenteditable=\"true\" class=\"(.*?locked.*?)\"\>)(.*?)(<\/span\>){2,}/gi, "$1$5</span>");
//				tx = tx.replace(/(<span contenteditable=\"true\" class=\"(.*?locked.*?)\"\>){2,}(.*?)(<\/span\>){2,}/gi, "<span contenteditable=\"true\" class=\"$2\">$3</span>");
//			}

			tx = tx.replace(/(<\/span\>)$(\s){0,}/gi, "</span> ");
			tx = tx.replace(/(<\/span\>\s)$/gi, "</span><br class=\"end\">");
			var prevNumTags = $('span.locked', this).length;
			$(this).html(tx);
			restoreSelection();

			if($('span.locked', this).length != prevNumTags) UI.closeTagAutocompletePanel();
            segment = $(this).parents('section');
            if($('span.locked', this).length) {
                segment.addClass('hasTags');
            } else {
                segment.removeClass('hasTags');
            }
            UI.detectTagType(this);

//            UI.checkTagsInSegment();
		});

	},
    detectTagType: function (area) {
        $('span.locked', area).each(function () {
//                console.log(segment.attr('id') + ' - ' + $(this).text());
//                console.log($(this).text().startsWith('</'));
            if($(this).text().startsWith('</')) {
                $(this).addClass('endTag')
            } else {
                if($(this).text().endsWith('/>')) {
                    $(this).addClass('selfClosingTag')
                } else {
                    $(this).addClass('startTag')
                }
            }
        })
    },

    unlockTags: function() {
		if (!this.taglockEnabled)
			return false;
		this.editarea.html(this.editarea.html().replace(/<span contenteditable=\"false\" class=\"locked\"\>(.*?)<\/span\>/gi, "$1"));
//		this.editarea.html(this.editarea.html().replace(/<span contenteditable=\"true\" class=\"locked\"\>(.*?)<\/span\>/gi, "$1"));
	},
	
	// TAG CLEANING
	cleanDroppedTag: function(area, beforeDropHTML) {
 //       if (area == this.editarea) {
			this.droppingInEditarea = false;

			diff = this.dmp.diff_main(beforeDropHTML, $(area).html());
			draggedText = '';
			$(diff).each(function() {
				if (this[0] == 1) {
					draggedText += this[1];
				}
			});
			draggedText = draggedText.replace(/^(\&nbsp;)(.*?)(\&nbsp;)$/gi, "$2");
			dr2 = draggedText.replace(/(<br>)$/, '').replace(/(<span.*?>)\&nbsp;/,'$1');

			area.html(area.html().replace(draggedText, dr2));

			div = document.createElement("div");
			div.innerHTML = draggedText;
			isMarkup = draggedText.match(/^<span style=\"font\-size\: 13px/gi);
			saveSelection();

			if($('span .rangySelectionBoundary', area).length > 1) $('.rangySelectionBoundary', area).last().remove();
			if($('span .rangySelectionBoundary', area).length) {
				spel = $('span', area).has('.rangySelectionBoundary');
				rsb = $('span .rangySelectionBoundary', area).detach();
				spel.after(rsb);
			}
			phcode = $('.rangySelectionBoundary')[0].outerHTML;
			$('.rangySelectionBoundary').text(this.cursorPlaceholder);

			newTag = $(div).text();
			var cloneEl = area;
			// encode br before textification
			$('br', cloneEl).each(function() {
				$(this).replaceWith('[**[br class="' + this.className + '"]**]');				
			});
			newText = cloneEl.text().replace(draggedText, newTag);
			cloneEl = null;
			if(typeof phcode == 'undefined') phcode = '';

			area.text(newText);
			area.html(area.html().replace(this.cursorPlaceholder, phcode));
			restoreSelection();
			area.html(area.html().replace(this.cursorPlaceholder, '').replace(/\[\*\*\[(.*?)\]\*\*\]/gi, "<$1>"));
/*
		} else {
	// old cleaning code to be evaluated
			diff = this.dmp.diff_main(beforeDropHTML, $(area).html());
			draggedText = '';
			$(diff).each(function() {
				if (this[0] == 1) {
					draggedText += this[1];
				}
			});
			draggedText = draggedText.replace(/^(\&nbsp;)(.*?)(\&nbsp;)$/gi, "$2").replace(/(<br>)$/gi, '');
			div = document.createElement("div");
			div.innerHTML = draggedText;
			saveSelection();
			$('.rangySelectionBoundary', area).last().remove(); // eventually removes a duplicated selectionBoundary
			if($('span .rangySelectionBoundary', area).length) { // if there's a selectionBoundary inside a span, move the first after the latter
				spel = $('span', area).has('.rangySelectionBoundary');
				rsb = $('span .rangySelectionBoundary', area).detach();
				spel.after(rsb);
			}
			phcode = $('.rangySelectionBoundary')[0].outerHTML;
			$('.rangySelectionBoundary').text(this.cursorPlaceholder);

			newTag = $(div).text();
			newText = area.text().replace(draggedText, newTag);
			area.text(newText);
			area.html(area.html().replace(this.cursorPlaceholder, phcode));
			restoreSelection();
			area.html(area.html().replace(this.cursorPlaceholder, ''));			
		}
*/
	},
/*
    setExtendedTagMode: function (el) {
        console.log('setExtendedTagMode');
        segment = el || UI.currentSegment;
        $(segment).attr('data-tagMode', 'extended');
    },
    setCrunchedTagMode: function (el) {
        segment = el || UI.currentSegment;
        $(segment).attr('data-tagMode', 'crunched');
    },
*/
    setTagMode: function () {
        if(this.custom.extended_tagmode) {
            this.setExtendedTagMode();
        } else {
            this.setCrunchedTagMode();
        }
    },
    setExtendedTagMode: function () {
        this.body.addClass('tagmode-default-extended');
//        console.log('segment: ', segment);
        if(typeof UI.currentSegment != 'undefined') UI.pointToOpenSegment();
        this.custom.extended_tagmode = true;
        this.saveCustomization();
    },
    setCrunchedTagMode: function () {
        this.body.removeClass('tagmode-default-extended');
//        console.log('segment: ', segment);
        if(typeof UI.currentSegment != 'undefined') UI.pointToOpenSegment();
        this.custom.extended_tagmode = false;
        this.saveCustomization();
    },

    /*
        checkTagsInSegment: function (el) {
            segment = el || UI.currentSegment;
            hasTags = ($(segment).find('.wrap span.locked').length)? true : false;
            if(hasTags) {
                this.setExtendedTagMode(el);
            } else {
                this.setCrunchedTagMode(el);
            }
        },
    */
    enableTagMode: function () {
        UI.render(
            {tagModesEnabled: true}
        )
    },
    disableTagMode: function () {
        UI.render(
            {tagModesEnabled: false}
        )
    },
    checkTagProximity: function (w, range) {return false;
        nextEl = $(range.endContainer.nextElementSibling);
        prevEl = $(range.endContainer.previousElementSibling);

        //check if there is a tag ahed
        if($(nextEl).hasClass('locked')) {
            if(range.endOffset == range.endContainer.length - 1) {
                console.log('1');
                this.highlightCorrespondingTags(nextEl);
            } else {
                UI.removeHighlightCorrespondingTags();
            }
        } else if(($(nextEl).hasClass('undoCursorPlaceholder'))&&($(nextEl).next().hasClass('locked'))) {
            saveSelection();
//            console.log('UI.editarea.html(): ', UI.editarea.html());
/*
            for(var key in range.startContainer) {
                console.log('key: ' + key + '\n' + 'value: "' + range.startContainer[key] + '"');
            }
            */
            restoreSelection();
            content = UI.editarea.html();
            str = range.startContainer.wholeText + '<span class="undoCursorPlaceholder monad" contenteditable="false"></span><span contenteditable="false" class="locked';
            console.log('content: ', content);
            console.log('str: ', str);
            console.log('content.indexOf(str): ', content.indexOf(str));
            console.log('range.startOffset: ', range.startOffset);
            console.log('range.startContainer.length: ', range.startContainer.length);
            if(content.indexOf(str) > -1) { // escape false positives
                if(range.endOffset == range.endContainer.length) {
                    console.log('2');
                    this.highlightCorrespondingTags($(nextEl).next());
                } else {
                    UI.removeHighlightCorrespondingTags();
                }
            }
        } else {
            UI.removeHighlightCorrespondingTags();
        }
/*
        //check if there is a tag behind
        if($(prevEl).hasClass('locked')) {
            console.log("l'elemento precedente è un tag");
//            console.log('range.startOffset: ', range.startOffset);
//            console.log('range.startContainer.length: ', (range.startContainer.length));
            if(range.startOffset == 1) {
                this.highlightCorrespondingTags(prevEl);
            } else {
                UI.removeHighlightCorrespondingTags();
            }
        } else if(($(prevEl).hasClass('undoCursorPlaceholder'))&&($(prevEl).prev().hasClass('locked'))) {
            console.log("l'elemento precedente è un cursor placeholder, e quello ancora precedente un tag");

            content = UI.editarea.html();
            console.log('content: ', content);
            str = '&gt;</span><span class="undoCursorPlaceholder monad" contenteditable="false"></span>' + range.endContainer.wholeText;
//            str = range.startContainer.wholeText + '<span class="undoCursorPlaceholder monad" contenteditable="false"></span><span contenteditable="false" class="locked';
            console.log('content.indexOf(str): ', content.indexOf(str));
            if(content.indexOf(str) > -1) { // escape false positives
                if(range.startOffset == 1) {
                    this.highlightCorrespondingTags($(nextEl).next());
                } else {
                    UI.removeHighlightCorrespondingTags();
                }
            }
        }
*/

            return false;

        if(w == 'right') {
            nextEl = $(range.endContainer.nextElementSibling);
//            console.log('a: ', nextEl);
//            console.log('b: ', nextEl.next());
//            console.log('è quello dopo: ', (($(nextEl).hasClass('undoCursorPlaceholder'))&&($(nextEl).next().hasClass('locked'))));
            if($(nextEl).hasClass('locked')) {
                console.log('il prossimo è locked');
//            if(($(nextEl).hasClass('locked'))||(($(nextEl).hasClass('undoCursorPlaceholder'))&&($(nextEl).next().hasClass('locked')))) {
//                console.log('entra');
//                console.log('range.endOffset: ', range.endOffset);
//                console.log('range.endContainer.length: ', range.endContainer.length);
//                if((range.endOffset == range.endContainer.length - 1)||(range.endOffset == range.endContainer.length)) {
                if(range.endOffset == range.endContainer.length - 1) {
                    this.highlightCorrespondingTags(nextEl);
                } else {
                    UI.removeHighlightCorrespondingTags();
                }
            } else if(($(nextEl).hasClass('undoCursorPlaceholder'))&&($(nextEl).next().hasClass('locked'))) {
                content = UI.editarea.html();
                str = range.startContainer.wholeText + '<span class="undoCursorPlaceholder monad" contenteditable="false"></span><span contenteditable="false" class="locked';
                if(content.indexOf(str) > -1) { // escape false positives
                    if(range.endOffset == range.endContainer.length) {
                        this.highlightCorrespondingTags($(nextEl).next());
                    } else {
                        UI.removeHighlightCorrespondingTags();
                    }
                }

//                console.log('il prossimo è placeholder e quello dopo è locked');
//                console.log('content: ', content);
//                console.log('str: ', str);
//                console.log('str è contenuta nel content? ', content.indexOf(str));
//                console.log('range: ', range);
//                console.log('range.startOffset: ', range.startOffset);
//                console.log('range.startContainer.data: ', range.startContainer.data + '<span class="undoCursorPlaceholder monad" contenteditable="false"></span><span contenteditable="false" class="locked');
//                console.log(UI.editarea.html());
//                console.log(UI.editarea.html().indexOf(range.startContainer.data + '<span class="undoCursorPlaceholder monad" contenteditable="false"></span><span contenteditable="false" class="locked'));
//                console.log('range.startContainer: ', range.startOffset);
/*
                for(var key in range.startContainer) {
                    console.log('key: ' + key + '\n' + 'value: "' + range.startContainer[key] + '"');
                }
*/
//                console.log('range.commonAncestorContainer.innerHTML: ', range.commonAncestorContainer.innerHTML);

            } else {
                UI.removeHighlightCorrespondingTags();
            }
            /*
                        console.log('range: ', range);
                        if(range.endOffset == range.endContainer.length - 1) {
            //            if((range.endOffset == range.endContainer.length - 1)||(range.endOffset == range.endContainer.length)) {
                            console.log('nextElementSibling: ', $(range.endContainer.nextElementSibling));
                            if($(range.endContainer.nextElementSibling).hasClass('locked')) {
                                this.highlightCorrespondingTags($(range.endContainer.nextElementSibling));
                                console.log('tag nei pressi: ', $(range.endContainer.nextElementSibling));
                            } else {
                                UI.removeHighlightCorrespondingTags();
                            }
                        } else {
                            UI.removeHighlightCorrespondingTags();
                        }
            */
        } else {
            prevEl = $(range.startContainer.previousElementSibling);
            if($(prevEl).hasClass('locked')) {
                if(range.startOffset == range.startContainer.length - 1) {
                    this.highlightCorrespondingTags(prevEl);
                } else {
                    UI.removeHighlightCorrespondingTags();
                }
            } else if(($(prevEl).hasClass('undoCursorPlaceholder'))&&($(prevEl).prev().hasClass('locked'))) {
//                content = UI.editarea.html();
//                str = range.endContainer.wholeText + '<span class="undoCursorPlaceholder monad" contenteditable="false"></span><span contenteditable="false" class="locked';
//                str = '<span class="undoCursorPlaceholder monad" contenteditable="false"></span><span contenteditable="false" class="locked'
            } else {
                UI.removeHighlightCorrespondingTags();
            }



            /*
                        if(range.startOffset == 1) {
            //            if((range.startOffset == 0)||(range.startOffset == 1)) {
                            if($(range.startContainer.previousElementSibling).hasClass('locked')) {
                                this.highlightCorrespondingTags($(range.startContainer.previousElementSibling));
                                console.log('tag nei pressi: ', $(range.startContainer.previousElementSibling));
                            } else {
                                UI.removeHighlightCorrespondingTags();
                            }
                        } else {
                            UI.removeHighlightCorrespondingTags();
                        }
            */
        }
    },
    highlightCorrespondingTags: function (el) {
        if(el.hasClass('startTag')) {
//            console.log('has start tag');
            if(el.next('.endTag').length) {
                el.next('.endTag').addClass('highlight');
            } else {
//                console.log('il successivo non è un end tag');
                num = 1;
                ind = 0;
                $(el).nextAll('.locked').each(function () {
                    ind++;
//                    console.log('ora stiamo valutando: ', $(this));
                    if($(this).hasClass('startTag')) {
                        num++;
                    } else if($(this).hasClass('selfClosingTag')) {

                    } else { // end tag
                        num--;
                        if(num == 0) {
                            console.log('found el: ', $(this));
                            pairEl = $(this);
                            return false;
                        }
                    }
//                    $(this).addClass('test-' + num);

                })
                $(pairEl).addClass('highlight');


            }
//            console.log('next endTag: ', el.next('.endTag'));
        } else if(el.hasClass('endTag')) {
            console.log('is an end tag');
            if(el.prev('.startTag').length) {
                console.log('and the previous element is a start tag');
                el.prev('.startTag').first().addClass('highlight');
            } else {
                console.log('and the previous element is not a start tag');
                num = 1;
                ind = 0;
                $(el).prevAll('.locked').each(function () {
                    ind++;
                    console.log('start tag: ', $(this));

                    if($(this).hasClass('endTag')) {
                        num++;
                    } else if($(this).hasClass('selfClosingTag')) {

                    } else { // end tag
                        num--;
                        if(num == 0) {
                            console.log('found el: ', $(this));
                            pairEl = $(this);
                            return false;
                        }
                    }

                });
                $(pairEl).addClass('highlight');
            }
        }
//        console.log('$(el): ', $(el));
        $(el).addClass('highlight');


//        console.log('$(pairEl).length: ', $(pairEl).length);

//        UI.editarea.find('.locked')

    },
    removeHighlightCorrespondingTags: function () {
        $(UI.editarea).find('.locked.highlight').removeClass('highlight');
    },

    // TAG MISMATCH
	markTagMismatch: function(d) {
        if(($.parseJSON(d.warnings).length)) {
//            $('#segment-' + d.id_segment).attr('data-tagMode', 'extended');
        }
//        $('#segment-' + d.id_segment).attr('data-tagMode', 'extended');
//        this.setExtendedTagMode($('#segment-' + d.id_segment));
        // temp
//        d.tag_mismatch.order = 2;
        if((typeof d.tag_mismatch.order == 'undefined')||(d.tag_mismatch.order === '')) {
            if(typeof d.tag_mismatch.source != 'undefined') {
                $.each(d.tag_mismatch.source, function(index) {
                    $('#segment-' + d.id_segment + ' .source span.locked:not(.temp)').filter(function() {
                        return $(this).text() === d.tag_mismatch.source[index];
                    }).last().addClass('temp');
                });
            }
            if(typeof d.tag_mismatch.target != 'undefined') {
                $.each(d.tag_mismatch.target, function(index) {
                    $('#segment-' + d.id_segment + ' .editarea span.locked:not(.temp)').filter(function() {
                        return $(this).text() === d.tag_mismatch.target[index];
                    }).last().addClass('temp');
                });
            }

            $('#segment-' + d.id_segment + ' span.locked.mismatch').addClass('mismatch-old').removeClass('mismatch');
            $('#segment-' + d.id_segment + ' span.locked.temp').addClass('mismatch').removeClass('temp');
            $('#segment-' + d.id_segment + ' span.locked.mismatch-old').removeClass('mismatch-old');
        } else {
            $('#segment-' + d.id_segment + ' .editarea .locked' ).filter(function() {
                return $(this).text() === d.tag_mismatch.order[0];
            }).addClass('order-error');
        }

	},	

	// TAG AUTOCOMPLETE
	checkAutocompleteTags: function() {//console.log('checkAutocompleteTags');
//        console.log('checkAutocompleteTags: ', UI.editarea.html() );
		added = this.getPartialTagAutocomplete();
//		console.log('added: "', added + '"');
//		console.log('aa: ', UI.editarea.html());
		$('.tag-autocomplete li.hidden').removeClass('hidden');
		$('.tag-autocomplete li').each(function() {
			var str = $(this).text();
//            console.log('"' + str.substring(0, added.length) + '" == "' + added + '"');
			if( str.substring(0, added.length) === added ) {
				$(this).removeClass('hidden');
			} else {
				$(this).addClass('hidden');	
			}
		});
//		console.log('bb: ', UI.editarea.html());
		if(!$('.tag-autocomplete li:not(.hidden)').length) { // no tags matching what the user is writing

			$('.tag-autocomplete').addClass('empty');
			if(UI.preCloseTagAutocomplete) {
				UI.closeTagAutocompletePanel();
				return false;				
			}
			UI.preCloseTagAutocomplete = true;
		} else {
//			console.log('dd: ', UI.editarea.html());

			$('.tag-autocomplete li.current').removeClass('current');
			$('.tag-autocomplete li:not(.hidden)').first().addClass('current');
			$('.tag-autocomplete').removeClass('empty');		
//			console.log('ee: ', UI.editarea.html());
			UI.preCloseTagAutocomplete = false;
		}
	},
	closeTagAutocompletePanel: function() {
		$('.tag-autocomplete, .tag-autocomplete-endcursor').remove();
		UI.preCloseTagAutocomplete = false;
	},
	getPartialTagAutocomplete: function() {
//		console.log('inizio di getPartialTagAutocomplete: ', UI.editarea.html());
//		var added = UI.editarea.html().match(/&lt;([&;"\w\s\/=]*?)<span class="tag-autocomplete-endcursor">/gi);
		var added = UI.editarea.html().match(/&lt;(?:[a-z]*(?:&nbsp;)*["\w\s\/=]*)?<span class="tag-autocomplete-endcursor">/gi);
//        console.log('prova: ', UI.editarea.html().match(/&lt;(?:[a-z]*(?:&nbsp;)*["\w\s\/=]*)?<span class="tag-autocomplete-endcursor">\&/gi));
//		console.log('added 1: ', added);
		added = (added === null)? '' : htmlDecode(added[0].replace(/<span class="tag-autocomplete-endcursor"\>/gi, '')).replace(/\xA0/gi," ");
//        console.log('added 2: ', added);
		return added;
	},
	openTagAutocompletePanel: function() {
		if(!UI.sourceTags.length) return false;
		$('.tag-autocomplete-marker').remove();

		var node = document.createElement("span");
		node.setAttribute('class', 'tag-autocomplete-marker');
		insertNodeAtCursor(node);
		var endCursor = document.createElement("span");
		endCursor.setAttribute('class', 'tag-autocomplete-endcursor');
//        console.log('prima di inserire endcursor: ', UI.editarea.html());
		insertNodeAtCursor(endCursor);
//		console.log('inserito endcursor: ', UI.editarea.html());
		var offset = $('.tag-autocomplete-marker').offset();
		var addition = ($(':first-child', UI.editarea).hasClass('tag-autocomplete-endcursor'))? 30 : 20;
		$('.tag-autocomplete-marker').remove();
		UI.body.append('<div class="tag-autocomplete"><ul></ul></div>');
		var arrayUnique = function(a) {
			return a.reduce(function(p, c) {
				if (p.indexOf(c) < 0) p.push(c);
				return p;
			}, []);
		};
		UI.sourceTags = arrayUnique(UI.sourceTags);
		$.each(UI.sourceTags, function(index) {
			$('.tag-autocomplete ul').append('<li' + ((index === 0)? ' class="current"' : '') + '>' + this + '</li>');
		});
		
		$('.tag-autocomplete').css('top', offset.top + addition);
		$('.tag-autocomplete').css('left', offset.left);
		this.checkAutocompleteTags();
	},
	jumpTag: function(range) {
//        console.log('RANGE IN JUMPTAG: ', range);
//        for(var key in range.endContainer) {
//            console.log('key: ' + key + '\n' + 'value: "' + range.endContainer[key] + '"');
//        }
//        console.log('data: ', range.endContainer);
		if((range.endContainer.data.length == range.endOffset)&&(range.endContainer.nextElementSibling.className == 'monad')) {
//			console.log('da saltare');
			setCursorAfterNode(range, range.endContainer.nextElementSibling);
		}
	},

});


