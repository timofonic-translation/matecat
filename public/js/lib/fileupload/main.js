/*
 * jQuery File Upload Plugin JS Example 6.7
 * https://github.com/blueimp/jQuery-File-Upload
 *
 * Copyright 2010, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

/*jslint nomen: true, unparam: true, regexp: true */
/*global $, window, document */

UI = null;

var base = Math.log( config.maxFileSize ) / Math.log( 1024 );
delete window.base;
config.maxFileSizePrint = parseInt( Math.pow( 1024, ( base - Math.floor( base ) ) ) + 0.5 ) + ' MB';

UI = {
    init: function() {
        UI.conversionBlocked = false;
    },
    enableAnalyze: function() {
        enableAnalyze();
    },
    conversionsAreToRestart: function() {
        var num = 0;
		$('.template-download .name').each(function(){
			if($(this).parent('tr').hasClass('failed')) return;
			if($(this).text().split('.')[$(this).text().split('.').length-1] != 'sdlxliff') num++;
		});
        return num
    },
    confirmRestartConversions: function() {
        UI.restartConversions();
    },
    errorsBeforeUpload: function(file) {
//        console.log(file);
        ext = file.name.split('.')[file.name.split('.').length - 1];
//        console.log(ext);
        msg = 'Format not supported. Convert to DOCX and upload the file again.';
//        msg = 'Format not supported. Convert to DOCX and upload the file again...';
        if(file.type.match(/^image/)) {
            msg = 'Images not allowed in MateCat';
        } else if(
                (file.type == 'application/zip'||
                        file.type == 'application/x-gzip' ||
                        file.type == 'application/x-tar' ||
                        file.type == 'application/x-gtar' ||
                        file.type == 'application/x-7z-compressed') ||
                        ( ext == 'tgz' )
        ) {
                msg = 'ZIP archives not yet supported. Coming soon.';
        }

        console.log(file.size);
        if((file.size) > config.maxFileSize) {
            msg = 'Error during upload. The uploaded file exceed the file size limit of ' + config.maxFileSizePrint;
        }
		UI.checkFailedConversionsNumber();
		
        return msg;
    },
    restartConversions: function() {
    	console.log('restart conversions');
        this.conversionBlocked = true;
    	$('.template-download, .template-upload').each(function() {
			if(config.conversionEnabled) {
        		var filerow = $(this);
        		var filename = $('.name',filerow).text();
        		var filesize =  ($('.size span',filerow).length)? parseFloat($('.size span',filerow).text().split(' ')[0])*1000000 : 0;
//        		console.log(filename);

//        		var filerow = data.context;
//        		var filesize = 0;
				var currentSession = $(filerow).data('session');
				$.each(UI.conversionRequests, function() {
					if(this.session == currentSession) {
						$(filerow).addClass('restarting');
						console.log('session: ' + this.session);
						this.request.abort();
					}
				});
				
				$(filerow).data('session','');
				$('.operation',filerow).remove();
				$('.progress',filerow).remove();
				  console.log('ACTION: restartConversions');
				convertFile(filename,filerow,filesize);
			}
    	});
    },
    
    checkAnalyzability: function() {
    	return checkAnalyzability();
    },
    
    checkFailedConversionsNumber: function() {
    	return checkFailedConversionsNumber();
    }
}

$(function () {
    'use strict';

    // Initialize the jQuery File Upload widget:
    $('#fileupload').fileupload();

    // Enable iframe cross-domain access via redirect option:
    $('#fileupload').fileupload(
        'option',
        'redirect',
        window.location.href.replace(
            /\/[^\/]*$/,
            '/cors/result.html?%s'
        )
    );
    var dropzone = $('#overlay');
    var langCorrections = [];
    UI.conversionRequests = [];

	$(document).bind('drop dragover', function (e) {
	    e.preventDefault();
	});

    $('#fileupload').fileupload(
        'option',
	    {
	        dropZone: $('.drag'),
	        autoUpload: true,
	        singleFileUploads: true,
	        overlayClose: true,
	        maxFileSize: config.maxFileSize, // 30MB
//	        maxChunkSize: 1000000,
//	        multipart: false,
	        fileInput: $('#fileupload .multiple-button, .btncontinue .multiple-button'),
//	        acceptFileTypes: /(\.|\/)(xliff|sdlxliff|xlf)$/i
	        acceptFileTypes: config.allowedFileTypes
	    }
    );
	$('#fileupload').bind('fileuploaddragover', function (e) {
		$('.upload-files').addClass('dragging');
        dropzone.show();
	}).bind('fileuploadadd', function (e, data) {
		console.log('FIRE fileuploadadd');
//        console.log($('.upload-table tr'));
		console.log(data);
        console.log(data.files[0].size);
        console.log(config.maxFileSize);
        console.log(data.files[0].type);
        
//        if(!isValidFileExtension(data.files[0].name)) {
//            alert($('.upload-table tr').length);
//			jqXHR = data.submit();
//			jqXHR.abort();
//        }
        if(data.files[0].size > config.maxFileSize) {
//            jqXHR = data.submit();
//            jqXHR.abort();            
        }
         $('body').addClass('initialized');


		if($('.upload-table tr').length >= (config.maxNumberFiles)) {
			console.log('adding more than 10');
//			$('.error-message').text('No more files can be loaded (the limit of ' + maxnum + ' has been exceeded).').show();
			jqXHR = data.submit();
			jqXHR.abort();
		}
/*
		var maxnum = config.maxNumberFiles;
		if($('.upload-table tr').length > (maxnum-1)) {
			console.log('more than 10');
			$('.error-message').text('No more files can be loaded (the limit of ' + maxnum + ' has been exceeded).').show();
			jqXHR = data.submit();
			jqXHR.abort();
		} else {
			$('.error-message').empty().hide();
			
		}
*/

/*
		if($('.upload-table tr').length > (maxnum-1)) {
			
			alert(maxnum + ' files already loaded. Limix exceeded');
			jqXHR = data.submit();
			jqXHR.abort();
		}
*/
		disableAnalyze();
		$('#fileupload table.upload-table tr').addClass('current');

/*
		if(data.files.length > 1) {
			$('#fileupload').bind('fileuploadsend.preventMore', function (e) {
				$('table.upload-table tbody').empty();
				alert('Actually only one file for each project can be uploaded. Please retry.');
				$('#fileupload').unbind('fileuploadsend.preventMore');
				return false;
			});
		};
*/
	}).bind('fileuploadsend', function (e,data) {
        console.log('FIRE fileuploadsend');
        console.log(data.files);
		$('.progress', $(data.context[0])).before('<div class="operation">Uploading</div>');
	}).bind('fileuploadprogress', function (e,data) {
//		console.log(data.loaded);
	}).bind('fileuploadstart', function (e) {
		console.log('FIRE fileuploadstart');
//		if(!$.cookie("upload_session")) $.cookie("upload_session",uploadSessionId);
	}).bind('fileuploaddone', function (e,data) {
//		$('.size', $(data.context[0])).next().append('<div class="operation">Converting</div>');

//		console.log($(data.context[0]));
//		if(!$.cookie("upload_session")) $.cookie("upload_session",uploadSessionId);
	}).bind('fileuploaddrop', function (e) {
		$('.upload-files').addClass('uploaded');
		$('.upload-files').removeClass('dragging dnd-hover');
        dropzone.hide();
	}).bind('fileuploaddone', function (e,data) {
		
	}).bind('fileuploadadded fileuploaddestroyed', function (e,data) {
		if($('.upload-table tr').length) {
			$('.upload-files').addClass('uploaded');
		} else {
			$('.upload-files').removeClass('uploaded');
		}
	}).bind('fileuploadfail', function (e) {
		if(!($('.upload-table tr').length > 1)) $('.upload-files').removeClass('uploaded');
        checkFailedConversionsNumber();
	}).bind('fileuploadchange', function (e) {
        console.log('FIRE fileuploadchange');
        checkFailedConversionsNumber();
	}).bind('fileuploaddestroyed', function (e,data) {
//		var err = $.parseJSON(data.jqXHR.responseText)[0].error;
        console.log('file deleted');
        if($('.error-message.no-more').length) {

			if($('.upload-table tr').length < (config.maxNumberFiles)) {
				$('.error-message').empty().hide();
		    	$('#fileupload').fileupload('option', 'dropZone', $('.drag'));
		    	$('#add-files').removeClass('disabled');
		    	$('#add-files input').removeAttr('disabled');
			}
        	
        }
        checkFailedConversionsNumber();
//		console.log('$(\'.upload-table tr\').length: ' + $('.upload-table tr').length);
//		console.log('checkAnalyzability(): ' + checkAnalyzability());
		if($('.upload-table tr:not(.failed)').length) {
			if(checkAnalyzability('fileuploaddestroyed')) {
				enableAnalyze();
			}
//			if(typeof err == 'undefined') enableAnalyze();
		} else {
			disableAnalyze();
		}
/*
	}).bind('fileuploadcompleted fileuploaddestroyed', function (e,data) {
//		var err = $.parseJSON(data.jqXHR.responseText)[0].error;
		if($('.upload-table tr').length) {
			enableAnalyze();
//			if(typeof err == 'undefined') enableAnalyze();
		} else {
			disableAnalyze();
		}
*/
	}).on('click', '.template-upload .cancel button', function (e,data) {
//		var err = $.parseJSON(data.jqXHR.responseText)[0].error;
        console.log('file canceled');
        if($('.error-message.no-more').length) {

			if($('.upload-table tr').length < (config.maxNumberFiles)) {
				$('.error-message').empty().hide();
		    	$('#fileupload').fileupload('option', 'dropZone', $('.drag'));
		    	$('#add-files').removeClass('disabled');
		    	$('#add-files input').removeAttr('disabled');
			}
        	
        }
		setTimeout(function(){
        	checkFailedConversionsNumber();
        },500);
//		console.log('$(\'.upload-table tr\').length: ' + $('.upload-table tr').length);
//		console.log('checkAnalyzability(): ' + checkAnalyzability());
		if($('.upload-table tr:not(.failed)').length) {
			if(checkAnalyzability('fileuploaddestroyed')) {
				enableAnalyze();
			}
//			if(typeof err == 'undefined') enableAnalyze();
		} else {
			disableAnalyze();
		}
	}).bind('fileuploadcompleted', function (e,data) {
		console.log('FIRE fileuploadcompleted');
         if(!$('body').hasClass('initialized')) {
             console.log($('#clear-all-files').length);
             $('#clear-all-files').click();
//             $('.upload-table tr').remove();
         }
		var maxnum = config.maxNumberFiles;
		if($('.upload-table tr').length > (maxnum-1)) {
			console.log('10 files loaded');
			$('.error-message').addClass('no-more').text('No more files can be loaded (the limit of ' + maxnum + ' has been exceeded).').show();
		    $('#fileupload').fileupload('option', 'dropZone', null);
		    $('#add-files').addClass('disabled');
		    $('#add-files input').attr('disabled', 'disabled');

//			jqXHR = data.submit();
//			jqXHR.abort();
		} else {
/*
			$('.error-message').empty().hide();
			console.log('else');
		    $('#fileupload').fileupload('option', 'dropZone', $('.drag'));
*/			
		}
/*
		console.log('completed:');
		console.log($('.template-download'));
		console.log(data.files[0]);
*/
//		console.log($('.template-download .name').text());
//		console.log(data.context);
//		console.log(data.context.attr('class'));
//		console.log(data.files[0].name);
		$('body').addClass('initialized');
            /*
             * BUG FIXED: UTF16 / UTF8 File name conversion
             * Use Return String From AJAX RESULT ( safe raw url encoded )
             *      and NOT data.files[0].name; ( INPUT TAG content )
             *
             *      fname: data.result[0].name,
             *
             **/
        var fileSpecs = {
            fname: data.result[0].name,
            filesize: data.result[0].size,
            filerow: data.context,
            extension: data.result[0].name.split('.')[data.result[0].name.split('.').length-1],
            error: ( typeof data.result[0].error !== 'undefined' ? data.result[0].error : false ),
            enforceConversion: data.result[0].convert
        };

        //check for specific xlf file type, someone needs forced conversion /** @see upload.class.php */
//		if( ( fileSpecs.extension=='xliff' || fileSpecs.extension=='sdlxliff' || fileSpecs.extension=='xlf' ) && !fileSpecs.enforceConversion ) {
////			console.log('checkAnalyzability(): '+checkAnalyzability());
//			if(checkAnalyzability('file upload completed')) {
//				enableAnalyze();
//			}
//		}

        if( !fileSpecs.enforceConversion ){
            if(checkAnalyzability('file upload completed')) {
                enableAnalyze();
            }
        }

		if($('body').hasClass('started')) {
			setFileReadiness();
			if(checkAnalyzability('primo caricamento')) {
				enableAnalyze();
			}
		}
		$('body').removeClass('started');

        //console.log(data.data);

        $('.name',fileSpecs.filerow).text(fileSpecs.fname);

        if ( typeof data.data != 'undefined' && !fileSpecs.error ) {

            if ( config.conversionEnabled ) {

//				console.log('fileuploadcompleted');
//				console.log('hasclass converting?: ' + fileSpecs.filerow.hasClass('converting'));

                if ( !fileSpecs.filerow.hasClass( 'converting' ) ) {
                    //console.log( filerow );
                    console.log( 'ACTION: bind fileuploadcompleted' );
                    convertFile( fileSpecs.fname, fileSpecs.filerow, fileSpecs.filesize, fileSpecs.enforceConversion );
                }

            } else {
                enableAnalyze();
            }

        } else if ( fileSpecs.error ) {
            disableAnalyze();
            $( '.error-message' ).addClass( 'no-more' ).text( 'An error occurred during upload.' ).show();
            $( '#fileupload' ).fileupload( 'option', 'dropZone', null );
            $( '#add-files' ).addClass( 'disabled' );
            $( '#add-files input' ).attr( 'disabled', 'disabled' );
        }
	
		if($('.upload-table tr').length) {
			$('.upload-files').addClass('uploaded');
		} else {
			$('.upload-files').removeClass('uploaded');
		}

	});

	$('.upload-files').bind('dragleave', function (e) {
		$(this).removeClass('dragging');
	});

/*
    $('[draggable="true"]').on('dragstart', function() {
    	console.log('start');
//        dropzone.show();
    })
*/
/*
    $('[draggable="true"]').on('dragstart', function() {
    	console.log('start');
        dropzone.show();
    }).on('dragend', function() {
    	console.log('stop');
        dropzone.hide();
    });
*/
/*
    dropzone.on('dragenter', function(event) {
        $('.upload-files').addClass('dnd-hover');
    });

    dropzone.on('dragleave', function(event) {
        $('.upload-files').removeClass('dnd-hover');
    });
*/


    $('[draggable="true"]').on('dragend', function() {
        dropzone.hide();
    });

    dropzone.on('dragenter', function(event) {
        $('.upload-files').addClass('dnd-hover');
    });

    dropzone.on('dragleave', function(event) {
        $('.upload-files').removeClass('dnd-hover');
    });

    $('#clear-all-files').bind('click', function (e) {
        e.preventDefault();
        $('.error-message').hide();
        $('.template-download .delete button, .template-upload .cancel button').click();
	});

    $('#delete-failed-conversions').bind('click', function (e) {
    	e.preventDefault();
        console.log($('.template-download.failed .delete button, .template-download.has-errors .delete button, .template-upload.failed .cancel button, .template-upload.has-errors .cancel button'));
    	$('.template-download.failed .delete button, .template-download.has-errors .delete button, .template-upload.failed .cancel button, .template-upload.has-errors .cancel button').click();
	});
		
    if (window.location.hostname === 'blueimp.github.com') {
        // Demo settings:
        $('#fileupload').fileupload('option', {
            url: '//jquery-file-upload.appspot.com/',
            maxFileSize: 5000000,
            acceptFileTypes: /(\.|\/)(gif|jpe?g|png)$/i,
            process: [
                {
                    action: 'load',
                    fileTypes: /^image\/(gif|jpeg|png)$/,
                    maxFileSize: 20000000 // 20MB
                },
                {
                    action: 'resize',
                    maxWidth: 1440,
                    maxHeight: 900
                },
                {
                    action: 'save'
                }
            ]
        });
        // Upload server status check for browsers with CORS support:
        if ($.support.cors) {
            $.ajax({
                url: '//jquery-file-upload.appspot.com/',
                type: 'HEAD'
            }).fail(function () {
                $('<span class="alert alert-error"/>')
                    .text('Upload server currently unavailable - ' +
                            new Date())
                    .appendTo('#fileupload');
            });
        }
    } else {
        // Load existing files:
        $('#fileupload').each(function () {
            var that = this;
            $.getJSON(this.action, function (result) {
                if (result && result.length) {
                    $(that).fileupload('option', 'done')
                        .call(that, null, {result: result});
                }
            });
        });
    }

    // Initialize the Image Gallery widget:
//    $('#fileupload .files').imagegallery();

    // Initialize the theme switcher:
    $('#theme-switcher').change(function () {
        var theme = $('#theme');
        theme.prop(
            'href',
            theme.prop('href').replace(
                /[\w\-]+\/jquery-ui.css/,
                $(this).val() + '/jquery-ui.css'
            )
        );
    });

});

userLangName = function(t, userLangCode) {
	return $('#' + t + '-lang  option[value=\'' + userLangCode + '\']').text();
}

progressBar = function(filerow,start,filesize) {
	var ob = $('.ui-progressbar-value', filerow);
	if(ob.hasClass('completed')) return;
	
//	console.log('file size: ' + filesize);
//	var step = filesize/100000;
//	console.log('step: ' + step);
	ob.css('width', start+'%');
	if(start > 90) {
//		$('.operation',filerow).remove();
//		$('.progress',filerow).remove();
		return;
	}
	if(!UI.conversionBlocked) {
        setTimeout(function(){
            progressBar(filerow,start+1,filesize);
    //        console.log()
        },200);        
    } else {
        UI.conversionBlocked = false;
    }

}

convertFile = function(fname,filerow,filesize, enforceConversion) {

    console.log( 'Enforce conversion: ' + enforceConversion );
    firstEnforceConversion = (typeof enforceConversion === "undefined") ? false : enforceConversion;
//    console.log(firstEnforceConversion);
    enforceConversion = (typeof enforceConversion === "undefined") ? false : enforceConversion;

//	filerow = data.context;
//	var fname = data.files[0].name;
//	var extension = fname.split('.')[fname.split('.').length-1];

	if( enforceConversion === false ) {
		filerow.addClass('ready');
			if(checkAnalyzability('convert file')) {
				enableAnalyze();
			}
		
		return;
	}
	else {
		disableAnalyze();
	}

	var ses = new Date();
	var session = ses.getTime();
//	console.log(session.getTime());	 
	filerow.removeClass('ready').addClass('converting').data('session',session);

	var request = $.ajax({
        url: '?action=convertFile',
        data: {
            action: 'convertFile',
            file_name: fname,
            source_lang: $('#source-lang').val(),
            target_lang: $('#target-lang').val()
        },
        type: 'POST',
        dataType: 'json',
        context: firstEnforceConversion,
        error: function(d){
			if($(filerow).hasClass('restarting')) {
				$(filerow).removeClass('restarting');
				return;
			}
			filerow.removeClass('converting');
       		console.log('conversion error');
       		console.log($('.progress',filerow));
			setTimeout(function(){
       			$('.progress',filerow).remove();
       			$('.operation',filerow).remove();
			},50);
//       		$('.progress',filerow).remove();
       		$('td.size',filerow).next().addClass('error').empty().attr('colspan','2').append('<span class="label label-important">Error: </span>Server error, try again.');
       		$(filerow).addClass('has-errors');
			UI.checkFailedConversionsNumber();
       		return false;
        },
        success: function(d){
//              console.log(this.context);
//			falsePositive = ((typeof this.context == 'undefined')||(!this.context))? false : true; // suggested solution
			falsePositive = (typeof this.context == 'undefined')? false : true; // old solution
            filerow.removeClass('converting');
			filerow.addClass('ready');
           	if( d.code == 1 ) {
				$('.ui-progressbar-value', filerow).addClass('completed').css('width', '100%');
//				console.log('checkAnalyzability(): '+checkAnalyzability());
				if(checkAnalyzability('convertfile on success')) {
					enableAnalyze();
				}
				$('.operation',filerow).fadeOut('slow', function() {
					// Animation complete.
				});
				$('.progress',filerow).fadeOut('slow', function() {
					// Animation complete.
				});
           	} else if( d.code < 0 ){
                console.log(d.errors[0].message);
                $('td.size',filerow).next().addClass('error').empty().attr('colspan','2').css({'font-size':'14px'}).append('<span class="label label-important">'+d.errors[0].message+'</span>');
                $(filerow).addClass('failed');
                setTimeout(function(){
                    $('.progress',filerow).remove();
                    $('.operation',filerow).remove();
                },50);
                checkFailedConversionsNumber();
                return false;
            } else {
//       			console.log('conversion failed');
//           		var filename = $('.name',filerow).text();
//           		var extension = filename.split('.')[filename.split('.').length-1];
////           		console.log(extension);
////           		console.log(d.errors[0].message);
////           		if(!d.errors[0].message) console.log('msg is null');
//           		var msg = (!d.errors[0].message)? "Converter rebooting. Try again in two minutes" : d.errors[0].message;
//
//                var message = ((extension == 'pdf')&&(d.errors[0].code == '-2'))? 'Error: no translatable content found: maybe a scanned file?' : msg;
//				if(extension == 'docx') {
//					message = "Conversion error. Try opening and saving the document with a new name. If this does not work, try converting to DOC.";
//				}
//				if((extension == 'doc')||(extension == 'rtf')) {
//					message = "Conversion error. Try opening and saving the document with a new name. If this does not work, try converting to DOCX.";
//				}
//				if(extension == 'inx') {
//					message = "Conversion Error. Try to commit changes in InDesign before importing.";
//				}
//                // temp
//                //message = (falsePositive)? '' : 'Conversion Error. Try opening and saving the document with a new name.';
////                console.log(d.errors[0].code);
////                if(d.errors[0].code == -6) message = 'Error during upload. The uploaded file may exceed the file size limit of ' + config.maxFileSizePrint;
////                console.log(enforceConversion);
////                console.log(typeof enforceConversion);
//           		$('td.size',filerow).next().addClass('error').empty().attr('colspan','2').append('<span class="label label-important">'+message+'</span>');
//           		$(filerow).addClass('failed');
//           		console.log('after message compiling');
//				setTimeout(function(){
//	       			$('.progress',filerow).remove();
//	       			$('.operation',filerow).remove();
//				},50);
//           		checkFailedConversionsNumber();
//           		return false;
           	}

        }
    });
    var r = {};
    r.session = session;
    r.request = request;
    UI.conversionRequests.push(r);
	
	$('.size', filerow).next().append('<div class="operation">Importing</div><div class="converting progress progress-success progress-striped active ui-progressbar ui-widget ui-widget-content ui-corner-all" aria-valuenow="0" aria-valuemax="100" aria-valuemin="0" role="progressbar"><div class="ui-progressbar-value ui-widget-header ui-corner-left" style="width: 0%;"></div></div>');
//	console.log('filesize: ' + filesize);


	testProgress(filerow,filesize,session,0);
//	progressBar(filerow,0,filesize);
}

testProgress = function(filerow,filesize,session,progress) {
//    console.log('session: ' + session);
//    console.log('data-session: ' + $(filerow).data('session'));
    if(session != $(filerow).data('session')) return;

	if(typeof filesize == 'undefined') filesize = 1000000;
//	console.log('filesize: ' + filesize);
	var ob = $('.ui-progressbar-value', filerow);
	if(ob.hasClass('completed')) return;
//	var step = 50000/filesize;
	var step = 1;
	var stepWait = Math.pow(1.2,Math.log(filesize/1000)/Math.LN10 - 1)/10;
	
	progress = progress+step;
//	console.log(progress);

	ob.css('width', progress+'%');
	if(progress > 98) {
		return;
	}

	setTimeout(function(){
        testProgress(filerow,filesize,session,progress);
//        console.log()
    },Math.round(stepWait*1000));
}

checkInit = function() {
	setTimeout(function(){
        if($('body').hasClass('initialized')) {
            $('.template-upload').each(function () {
                console.log($(this).hasClass('has-errors'));
                console.log($('.name',$(this)).text());
//                sizeTxt = $('.size',$(this)).text();
//                console.log($(this).text());
//                size = parseFloat(sizeTxt.split(' ')[0]);
//                multiplier = (sizeTxt.split(' ')[1] == 'KB')? 1000 : 1000000;
//                if((size*multiplier) > config.maxFileSize) {
//                }
            });
			UI.checkFailedConversionsNumber();
            
            checkConversions();
        	return;
        } else {
        	checkInit();
        };
    },100);	
}

checkFailedConversionsNumber = function() {
    var n = $('.template-download.failed, .template-upload.failed, .template-download.has-errors, .template-upload.has-errors').length;
    if(n>1) {
    	$('#delete-failed-conversions').show();	
    } else {
    	$('#delete-failed-conversions').hide();
    }
}

checkAnalyzability = function(who) {
//	console.log(who);
//	console.log($('.upload-table tr:not(.failed)').length);
//	console.log($('.upload-table tr').length);
	if($('.upload-table tr:not(.failed)').length) {
		var res = true;
		$('.upload-table tr:not(.failed)').each(function(){
			if($(this).hasClass('converting')) {
				res = false;
			}
			if(!$(this).hasClass('ready')) {
				res = false;
			}
		})
		if($('.upload-table tr.failed').length) res = false;
		return res;
	} else {
		return false;
	};
}

isValidFileExtension = function(filename) {
//    res = false;
    console.log('filename: ' + filename);
    ext = filename.split('.')[filename.split('.').length - 1];
    res = (!filename.match(config.allowedFileTypes))? false : true;

/*    
    console.log(filename.match(config.allowedFileTypes) == 'null')? false : true;
    console.log(filename.match(config.allowedFileTypes));

    console.log(filename.match(config.allowedFileTypes));
    console.log(filename.match(!config.allowedFileTypes));
    console.log(filename.match(config.allowedFileTypes).length);
    */
//    console.log(typeof filename.match(config.allowedFileTypes));
//    console.log(typeof filename.match(config.allowedFileTypes) == 'null')? false : true;
//    $.each(config.allowedFileTypes.split('|'), function(item) {
//        console.log(this + ' - ' + ext);
//        if(this == ext) res = true;
//    });
    console.log(res);
    return res;
}

enableAnalyze = function() {
	$('.uploadbtn').removeAttr('disabled').removeClass('disabled').focus();
}

disableAnalyze = function() {
	$('.uploadbtn').attr('disabled','disabled').addClass('disabled');
}

setFileReadiness = function() {
	$('.upload-table tr').each(function(){
		if(!$(this).hasClass('converting')) $(this).addClass('ready');
	})	
}

checkConversions = function() {console.log('check conversions');
	if(!config.conversionEnabled) return;
	$('.upload-table tr:not(.has-errors)').each(function(){
        
		var name = $('.name',this).text();
		var extension = name.split('.')[name.split('.').length-1];

//		if((extension=='xliff')||(extension=='sdlxliff')||(extension=='xlf')) {
//			return;
//		} else {
			$.ajax({
	            url: '?action=checkFileConversion',
	            data: {
	                file_name: name
	            },
	            type: 'POST',
	            dataType: 'json',
				context: $(this),
	            success: function(d){
	            	if(d.converted == '1') {
						console.log(d.file_name + ' già convertito');
		           	} else {
						console.log(d.file_name + ' non ancora convertito');
			        	var filename = d.file_name;
			        	var filerow = this;
			        	if(filerow.hasClass('converting')) return;
                           console.log('ACTION: success of checkConversions');
						convertFile(filename,filerow);
					
				
						if($('.upload-table tr').length) {
							$('.upload-files').addClass('uploaded');
						} else {
							$('.upload-files').removeClass('uploaded');
						}
		           	}
	            }
	        });
			
//		}
    })
}

unsupported = function() {
	var jj = $('<div/>').html(config.unsupportedFileTypes).text();
	var pf = $.parseJSON(jj);
	return pf;
}


$(document).ready(function() {
	config.unsupported = unsupported();
	checkInit();
    UI.init();
});

