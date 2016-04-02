/*
 * Multi-Extension FITS module (March 31, 2016)
 */

/*jslint bitwise: true, plusplus: true, sloppy: true, vars: true, white: true, browser: true, devel: true, continue: true, unparam: true, regexp: true */
/*global $, jQuery, JS9, sprintf */

// create our namespace, and specify some meta-information and params
JS9.Mef = {};
JS9.Mef.CLASS = "JS9";    // class of plugins (1st part of div class)
JS9.Mef.NAME = "Mef";     // name of this plugin (2nd part of div class)
JS9.Mef.WIDTH =  800;	  // width of light window
JS9.Mef.HEIGHT = 240;	  // height of light window
JS9.Mef.BASE = JS9.Mef.CLASS + JS9.Mef.NAME;  // CSS base class name

JS9.Mef.marginHeight = 32;
JS9.Mef.marginWidth = 44;

// get a MefExtension id based on the file image id
JS9.Mef.imid = function(im, i){
    return im.id.replace(/\./g, "_").replace(/\[.*\]/g,"").replace(/[<>]/g,"_")
	+ "MefExtension_" + i;
};


// change the active extension
JS9.Mef.activeExtension = function(im, i){
    var id;
    if( im ){
	id = JS9.Mef.imid(im, i);
	$("." + JS9.Mef.BASE + "Extension")
	    .removeClass(JS9.Mef.BASE + "ExtensionActive")
	    .addClass(JS9.Mef.BASE + "ExtensionInactive");
	$("#" + id)
	    .removeClass(JS9.Mef.BASE + "ExtensionInactive")
	    .addClass(JS9.Mef.BASE + "ExtensionActive");
    }
};

// constructor: add HTML elements to the plugin
JS9.Mef.init = function(){
    var i, im, id, obj, s, div, htmlString;
    var that = this;
    var addExt = function(o, s, k){
	var c, j;
	var got = "";
	var doit = true;
	switch(o.type){
	case "image":
	    // look for 2D image
	    if( o.naxes.length < 2 ){
		doit = false;
	    }
	    break;
	case "table":
	case "ascii":
	    // look for x and y columns
	    for(j=0; j<o.cols.length; j++){
		c = o.cols[j];
		if( c.name === "X" || c.name === "x" ){
		    got += "x";
		}
		if( c.name === "Y" || c.name === "y" ){
		    got += "y";
		}
	    }
	    if( got !== "xy" && got !== "yx" ){
		doit = false;
	    }
	    break;
	}
	if( doit ){
	    htmlString = "<pre>&nbsp;&nbsp;"+s+"</pre>";
	} else {
	    htmlString = "<pre><strike>&nbsp;&nbsp;"+s+"</strike></pre>";
	}
	id = JS9.Mef.imid(im, k+1);
	div = $("<div>")
	    .addClass(JS9.Mef.BASE + "Extension")
	    .addClass(JS9.Mef.BASE + "ExtensionInactive")
	    .attr("id", id)
	    .html(htmlString)
            .width(that.divjq.width() - JS9.Mef.marginWidth)
	    .appendTo(that.mefContainer);
	if( doit ){
	    div.on("mousedown touchstart", function(evt){
		im.displayExtension(o.hdu);
		JS9.Mef.activeExtension(im, o.hdu);
	    });
	}
    };
    // on entry, these elements have already been defined:
    // this.div:      the DOM element representing the div for this plugin
    // this.divjq:    the jquery object representing the div for this plugin
    // this.id:       the id ofthe div (or the plugin name as a default)
    // this.display:  the display object associated with this plugin
    // this.dispMode: display mode (for internal use)
    //
    // clean main container
    this.divjq.html("");
    // add mef container to main
    this.mefContainer = $("<div>")
	.addClass(JS9.Mef.BASE + "Container")
	.attr("id", this.id + "MefContainer")
        .height(this.divjq.height() - JS9.Mef.marginHeight)
        .width(this.divjq.width())
	.appendTo(this.divjq);
    im  = this.display.image;
    if( !im ){
	this.mefContainer.html("<p><center>HDU extensions will be displayed here.</center>");
	return;
    }
    if( !im.hdus ){
	this.mefContainer.html("<p><center>HDU extensions not available for this image.</center>");
	return;
    }
    // reset main container
    s = sprintf("<p class='%s'><b>Click on a FITS HDU extension to display it:</b></p>", JS9.Mef.BASE + "Para");
    this.mefContainer.html(s);
    // add a formatted string for each extension
    for(i=0; i<im.hdus.length; i++){
	obj = im.hdus[i];
	s = JS9.hdus2Str([obj]).trim();
	addExt(obj, s, i);
    }
    // make the currently displayed extension active
    if( im.raw.hdu.fits.extnum ){
	JS9.Mef.activeExtension(im, im.raw.hdu.fits.extnum);
    }
};

// add this plugin into JS9
JS9.RegisterPlugin(JS9.Mef.CLASS, JS9.Mef.NAME, JS9.Mef.init,
		   {menuItem: "Extensions",
		    help: "help/mef.html",
		    plugindisplay: JS9.Mef.init,
		    onimageload: JS9.Mef.init,
		    onimagedisplay: JS9.Mef.init,
		    winTitle: "JS9 Multi-Extension FITS",
		    winResize: true,
		    winDims: [JS9.Mef.WIDTH, JS9.Mef.HEIGHT]});

