// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================


sc_require('views/controls');
sc_require('views/mini_controls');

/** 
  @class
  
  Renders a videoView using different technologies like HTML5 video tag, 
  quicktime and flash.
  
  This view wraps the different technologies so you can use one standard and 
  simple API to play videos.
  
  You can specify and array with the order of how the technologies will degrad
  depending on availability. For example you can set degradeList to be 
  ['html5', 'flash'] and it will load your video in a video tag if the 
  technology is available otherwise flash and if neither of the technologies 
  are available it will show a message saying that your machine needs to install
  one of this technologies.
  
  @extends SC.View
  @since SproutCore 1.1
*/

SC.VideoView = SC.View.extend({

  /** 
    Video view className. 
    @property {String}
  */
  classNames: 'sc-video-view',
  
  /** 
    Properties that trigger a re render of the view. If the value changes, it
    means that the video url changed.
    
    @property {Array}
  */
  displayProperties: ['value', 'shouldAutoResize'],
  
  /** 
    Reference to the video object once is created. 
    @property {Object}
  */
  
  videoObject:null,
  
  /** 
    Array containing the technologies and the order to load them depending
    availability
     
    @property {Array}
  */
  degradeList: ['html5','quicktime', 'flash'],
  
  /** 
    Current time in secs
    @property {Number}
  */
  currentTime: 0, 
  
  /** 
    Duration in secs
    @property {Number}
  */
  duration: 0, //video duration in secs
  
  /** 
    Volume. The value should be between 0 and 1
    @property {Number}
  */
  volume:0, //volume value from 0 to 1
  
  /** 
    Tells you if the video is paused or not.
    @property {Boolean}
  */
  paused: YES, //is the video paused

  /** 
    Tells you if the video is loaded.
    @property {Boolean}
  */

  loaded: NO, //has the video loaded
  
  /** 
    Indicates if the video has reached the end
    @property {Boolean}
  */
  
  ended: NO, //did the video finished playing
  
  /** 
    Indicates if the video is ready to be played.
    @property {Boolean}
  */
  
  canPlay: NO, //can the video be played
  
  /** 
    Width of the video in pixels.
    @property {Number}
  */
  videoWidth:0,
  
  /** 
    Width of the video in pixels.
    @property {Number}
  */
  videoHeight:0,
  
  /** 
    Flag to enable captions if available.
    @property {Boolean}
  */
  captionsEnabled: NO,
  
  loadedTimeRanges:[], //loaded bits
  
  poster: null,
  
  /** 
    Formatted currentTime. (00:00)
    @property {String}
  */
  time: function(){
    var currentTime=this.get('currentTime'),
        totaltimeInSecs = this.get('duration');
    var formattedTime = this._addZeros(Math.floor(currentTime/60))+':'+this._addZeros(Math.floor(currentTime%60))+"/"+this._addZeros(Math.floor(totaltimeInSecs/60))+':'+this._addZeros(Math.floor(totaltimeInSecs%60));
    return formattedTime;
  }.property('currentTime', 'duration').cacheable(),
  
  /** 
    Renders the appropiate HTML according for the technology to use.
    
    @param {SC.RenderContext} context the render context
    @param {Boolean} firstTime YES if this is creating a layer
    @returns {void}
  */
  render: function(context, firstTime) {
    var i, j, listLen, pluginsLen, id = SC.guidFor(this);
    if(firstTime){
      for(i=0, listLen = this.degradeList.length; i<listLen; i++){
        switch(this.degradeList[i]){
        case "html5":
          if(SC.browser.safari){
            context.push('<video src="'+this.get('value')+'"');
            if(this.poster){
              context.push(' poster="'+this.poster+'"');
            }
            // if(SC.browser.touch){
            //               context.push(' controls="true"');
            //             }
            context.push('/>');
            this.loaded='html5';
            return;
          }
          break;
        case "quicktime":
          if(SC.browser.msie){
            context.push('<object id="qt_event_source" '+
                        'classid="clsid:CB927D12-4FF7-4a9e-A169-56E4B8A75598" '+         
                        'codebase="http://www.apple.com/qtactivex/qtplugin.cab#version=7,2,1,0"> '+
                        '</object> ');
          }
          context.push('<object width="100%" height="100%"');
          if(SC.browser.msie){
            context.push('style="position: absolute; top:0px; left:0px; behavior:url(#qt_event_source);"');
          }
          context.push('classid="clsid:02BF25D5-8C17-4B23-BC80-D3488ABDDC6B" '+
                      'id="qt_'+id+'" '+
                      'codebase="http://www.apple.com/qtactivex/qtplugin.cab">'+
                      '<param name="src" value="'+this.get('value')+'"/>'+
                      '<param name="autoplay" value="false"/>'+
                      '<param name="loop" value="false"/>'+
                      '<param name="controller" value="false"/>'+
                      '<param name="postdomevents" value="true"/>'+
                      '<param name="kioskmode" value="true"/>'+
                      '<param name="bgcolor" value="000000"/>'+
                      '<param name="scale" value="aspect"/>'+
                      '<embed width="100%" height="100%" '+
                      'name="qt_'+id+'" '+
                      'src="'+this.get('value')+'" '+
                      'autostart="false" '+
                      'EnableJavaScript="true" '+
                      'postdomevents="true" '+
                      'kioskmode="true" '+
                      'controller="false" '+
                      'bgcolor="000000"'+
                      'scale="aspect" '+
                      'pluginspage="www.apple.com/quicktime/download">'+
                      '</embed></object>'+
                      '</object>');
          this.loaded='quicktime';
          return;
        case "flash":
          var flashURL= '/static/sproutcore/media/en/6f43b616196d064789aa09fcb4b2cc1e230eedb4/resources/videoCanvas.swf';

          var movieURL = this.get('value');
          if (!movieURL) return;

          if(movieURL.indexOf('http:')==-1){
            movieURL=location.protocol+'//'+location.host+movieURL;
          }
          if(movieURL.indexOf('?')!=-1){
            movieURL=movieURL.substring(0, movieURL.indexOf('?'));
          }
          movieURL = encodeURI(movieURL);
          context.push('<object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" '+
                        'codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=8,0,0,0" '+
                        'width="100%" '+
                        'height="100%" '+
                        'id="flash_'+id+'" '+
                        'align="middle">'+
        	              '<param name="allowScriptAccess" value="sameDomain" />'+
        	              '<param name="allowFullScreen" value="true" />'+
        	              '<param name="movie" value="'+flashURL+'&src='+movieURL+'&scid='+id+'" />'+
        	              '<param name="quality" value="autohigh" />'+
        	              '<param name="scale" value="default" />'+
        	              '<param name="wmode" value="transparent" />'+
        	              '<param name="menu" value="false" />'+
                        '<param name="bgcolor" value="#000000" />	'+
        	              '<embed src="'+flashURL+'&src='+movieURL+'&scid='+id+'" '+
        	              'quality="autohigh" '+
        	              'scale="default" '+
        	              'wmode="transparent" '+
        	              'bgcolor="#000000" '+
        	              'width="100%" '+
        	              'height="100%" '+
        	              'name="flash_'+id+'" '+
        	              'align="middle" '+
        	              'allowScriptAccess="sameDomain" '+
        	              'allowFullScreen="true" '+
        	              'menu="false" '+
        	              'type="application/x-shockwave-flash" '+
        	              'pluginspage="http://www.adobe.com/go/getflashplayer" />'+
        	              '</object>');
          this.loaded='flash';
          SC.VideoView.addToVideoFlashViews(this);
          return;
        default:
          context.push('video is not supported by your browser');
          return;
        }
      }
    }
  },
  
  valueObserver:function(){
    this.set('currentTime', 0); 
    this.set('duration', 0); 
    this.set('volume', 0); 
    this.set('paused', YES); 
    this.set('loaded', NO); 
    this.set('ended', NO); 
    this.set('canPlay', NO); 
    this.set('loadedTimeRanges', []); 
    this.replaceLayer();
  }.observes('value'),


  /** 
    This function is called everytime the frame changes. This is done to get 
    the right video dimensions for HTML5 video tag.
    
    @returns {void}
  */
  frameDidChange: function() { 
    if(this.loaded==="html5"){
      var fr= this.get('frame'),
          elem = this.$('video');
      elem.attr('width', fr.width);
      elem.attr('height', fr.height);
    }
  }.observes('frame'),
  
  /** 
    In didCreateLayer we add DOM events for video tag or quicktime.
    
    @returns {void}
  */
  didCreateLayer :function(){
    if(this.loaded==="html5"){
      this.addVideoDOMEvents();
      this.frameDidChange();
    }
    if(this.loaded==="quicktime"){
      this.addQTDOMEvents();
    }
  },
  
  didAppendToDocument :function(){
    if(this.loaded==="quicktime"){
      this.addQTDOMEvents();
    }
  },
  
  /** 
    Adds all the neccesary video DOM elements.
    
    @returns {void}
  */
  addVideoDOMEvents: function() {
    var videoElem, view=this;
    videoElem = this.$('video')[0];
    this.set('videoObject', videoElem);
    SC.Event.add(videoElem, 'durationchange', this, function () {
      SC.RunLoop.begin();
      view.set('duration', videoElem.duration);
      SC.RunLoop.end();
    }) ;
    SC.Event.add(videoElem, 'timeupdate', this, function () {
      SC.RunLoop.begin();
      view.set('currentTime', videoElem.currentTime);
      SC.RunLoop.end();
    }) ;
    SC.Event.add(videoElem, 'loadstart', this, function () {
      SC.RunLoop.begin();
      this.updateVideoElementLoadedTimeRanges(videoElem);
      view.set('volume', videoElem.volume);
      SC.RunLoop.end();
    });     
    SC.Event.add(videoElem, 'play', this, function () {
      SC.RunLoop.begin();
      view.set('paused', NO);
      SC.RunLoop.end();
    });     
    SC.Event.add(videoElem, 'pause', this, function () {
      SC.RunLoop.begin();
      view.set('paused', YES);
      SC.RunLoop.end();
    });     
    SC.Event.add(videoElem, 'loadedmetadata', this, function () {
      SC.RunLoop.begin();
      view.set('videoWidth', videoElem.videoWidth);
      view.set('videoHeight', videoElem.videoHeight);
      SC.RunLoop.end();
    });     
       
    SC.Event.add(videoElem, 'canplay', this, function () {
      SC.RunLoop.begin();
      this.updateVideoElementLoadedTimeRanges(videoElem);
      view.set('canPlay', YES);
      SC.RunLoop.end();
    });     
         
    SC.Event.add(videoElem, 'ended', this, function () {
      SC.RunLoop.begin();
      view.set('ended', YES);
      SC.RunLoop.end();
    });
    SC.Event.add(videoElem, 'progress', this, function (e) {
      SC.RunLoop.begin();
      this.updateVideoElementLoadedTimeRanges(videoElem);
       try{
          var trackCount=view.GetTrackCount(),i;
          for(i=1; i<=trackCount;i++){
            if("Closed Caption"===this.GetTrackType(i)){
              view._closedCaptionTrackIndex=i;
            }
          }
        }catch(f){}
      //view.set('loadedData', ev.loaded);
      //console.log('progress '+ev.loaded+","+ev.total );
      SC.RunLoop.end();
    });
         
    // SC.Event.add(videoElem, 'suspend', this, function () {
    //       SC.RunLoop.begin();
    //       console.log('suspend');
    //       SC.RunLoop.end();
    //     });     
    // SC.Event.add(videoElem, 'load', this, function () {
    //       SC.RunLoop.begin();
    //       console.log('load');
    //       SC.RunLoop.end();
    //     });     
    //     SC.Event.add(videoElem, 'abort', this, function () {
    //       SC.RunLoop.begin();
    //       console.log('abort');
    //       SC.RunLoop.end();
    //     });     
    //     SC.Event.add(videoElem, 'error', this, function () {
    //       SC.RunLoop.begin();
    //       console.log('error');
    //       SC.RunLoop.end();
    //     });     
    //     SC.Event.add(videoElem, 'loadend', this, function () {
    //       SC.RunLoop.begin();
    //       console.log('loadend');
    //       SC.RunLoop.end();
    //     });     
    //     SC.Event.add(videoElem, 'emptied', this, function () {
    //       SC.RunLoop.begin();
    //       console.log('emptied');
    //       SC.RunLoop.end();
    //     });     
    //     SC.Event.add(videoElem, 'stalled', this, function () {
    //       SC.RunLoop.begin();
    //       console.log('stalled');
    //       SC.RunLoop.end();
    //     });     
    // SC.Event.add(videoElem, 'loadeddata', this, function () {
    //       SC.RunLoop.begin();
    //       console.log('loadeddata');
    //       SC.RunLoop.end();
    //     });     
    //     SC.Event.add(videoElem, 'waiting', this, function () {
    //       SC.RunLoop.begin();
    //       console.log('waiting');
    //       SC.RunLoop.end();
    //     });     
    //     SC.Event.add(videoElem, 'playing', this, function () {
    //       SC.RunLoop.begin();
    //       console.log('playing');
    //       SC.RunLoop.end();
    //     });
    // SC.Event.add(videoElem, 'canplaythrough', this, function () {
    //       SC.RunLoop.begin();
    //       console.log('canplaythrough');
    //       SC.RunLoop.end();
    //     });     
    //     SC.Event.add(videoElem, 'seeking', this, function () {
    //       SC.RunLoop.begin();
    //       console.log('seeking');
    //       SC.RunLoop.end();
    //     });     
    //     SC.Event.add(videoElem, 'seeked', this, function () {
    //       SC.RunLoop.begin();
    //       console.log('seeked');
    //       SC.RunLoop.end();
    //     });
    // SC.Event.add(videoElem, 'ratechange', this, function () {
    //       SC.RunLoop.begin();
    //       console.log('ratechange');
    //       SC.RunLoop.end();
    //     });     
    //     SC.Event.add(videoElem, 'volumechange', this, function () {
    //       SC.RunLoop.begin();
    //       console.log('volumechange');
    //       SC.RunLoop.end();
    //     });
    
  },
  
  updateVideoElementLoadedTimeRanges: function(videoElem) {
    if(!videoElem) videoElem = this.$('video')[0];
    if(!this.loadedTimeRanges) this.loadedTimeRanges=[];
    else this.loadedTimeRanges.length=0;
    for (var j=0, jLen = videoElem.buffered.length; j<jLen; j++){
      this.loadedTimeRanges.push(videoElem.buffered.start(j));
      this.loadedTimeRanges.push(videoElem.buffered.end(j));
    }                                             
    //console.log('handled loadedTimeRanges='+this.loadedTimeRanges.toString());
    this.notifyPropertyChange('loadedTimeRanges');
  },
  
  /** 
     Adds all the neccesary quicktime DOM elements.

     @returns {void}
   */
  addQTDOMEvents: function() {
    var vid=this._getVideoObject(),
        videoElem = this.$()[0],
        view=this,
        dimensions;
    try{
      vid.GetVolume();
    }catch(e){
      console.log('loaded fail trying later');
      this.invokeLater(this.didAppendToDocument, 100);
      return;
    }
    this.set('videoObject', vid);
    this._setDurationFromQTVideoObject();
    this.set('volume', vid.GetVolume()/256);
    this._setDimensionsFromQTVideoObject();
    
    SC.Event.add(videoElem, 'qt_durationchange', this, function () {
      SC.RunLoop.begin();
      this._setDurationFromQTVideoObject();
      SC.RunLoop.end();
    });
    SC.Event.add(videoElem, 'qt_begin', this, function () {
      SC.RunLoop.begin();
      this.updateQTVideoObjectLoadedTimeRanges(vid);
      view.set('volume', vid.GetVolume()/256);
      SC.RunLoop.end();
    });
    SC.Event.add(videoElem, 'qt_loadedmetadata', this, function () {
      SC.RunLoop.begin();
      this._setDurationFromQTVideoObject();
      this.updateQTVideoObjectLoadedTimeRanges(vid);
      var dimensions=vid.GetRectangle().split(',');
      view.set('videoWidth', dimensions[2]);
      view.set('videoHeight', dimensions[3]);
      SC.RunLoop.end();
    });
    SC.Event.add(videoElem, 'qt_canplay', this, function () {
      SC.RunLoop.begin();
      this.updateQTVideoObjectLoadedTimeRanges(vid);
      view.set('canPlay', YES);
      SC.RunLoop.end();
    });
    
    SC.Event.add(videoElem, 'qt_ended', this, function () {
      view.set('ended', YES);
    });
    SC.Event.add(videoElem, 'qt_pause', this, function () {
      SC.RunLoop.begin();
      view.set('currentTime', vid.GetTime()/vid.GetTimeScale());
      view.set('paused', YES);
      SC.RunLoop.end();
    });
    SC.Event.add(videoElem, 'qt_play', this, function () {
      SC.RunLoop.begin();
      view.set('currentTime', vid.GetTime()/vid.GetTimeScale());
      view.set('paused', NO);
      SC.RunLoop.end();
    });
    // SC.Event.add(videoElem, 'qt_loadedfirstframe', this, function () {
    //       console.log('qt_loadedfirstframe');
    //     });
    // SC.Event.add(videoElem, 'qt_error', this, function () {
    //       console.log('qt_error');
    //     });
    // SC.Event.add(videoElem, 'qt_canplaythrough', this, function () {
    //       console.log('qt_canplaythrough');
    //     });
    SC.Event.add(videoElem, 'qt_load', this, function () {
      SC.RunLoop.begin();
      this.updateQTVideoObjectLoadedTimeRanges(vid);
      SC.RunLoop.end();
    });
    SC.Event.add(videoElem, 'qt_progress', this, function () {
      SC.RunLoop.begin();
      this.updateQTVideoObjectLoadedTimeRanges(vid);
      SC.RunLoop.end();
    });
    //     SC.Event.add(videoElem, 'qt_waiting', this, function () {
    //       console.log('qt_waiting');
    //     });
    //     SC.Event.add(videoElem, 'qt_stalled', this, function () {
    //       console.log('qt_stalled');
    //     });
    //     SC.Event.add(videoElem, 'qt_volumechange', this, function () {
    //       console.log('qt_volumechange');
    //     });
    // SC.Event.add(videoElem, 'qt_timechanged', this, function () {
      // SC.RunLoop.begin();
      //         view.set('currentTime', vid.GetTime()/vid.GetTimeScale());
      //         console.log('qt_timechanged');
      //         view.updateTime();
      //         SC.RunLoop.end();
    // });
  },
  
  updateQTVideoObjectLoadedTimeRanges: function(vid) {
    vid = vid || this._getVideoObject();
    if(!this.loadedTimeRanges) this.loadedTimeRanges=[];
    else this.loadedTimeRanges.length = 0;
    this.loadedTimeRanges.push(0);
    this.loadedTimeRanges.push(vid.GetMaxTimeLoaded()/vid.GetTimeScale());
    this.notifyPropertyChange('loadedTimeRanges');
  },
  
  _setDurationFromQTVideoObject: function(vid) {
    if(!vid) vid = this._getVideoObject();
    try{ this.set('duration', vid.GetDuration()/vid.GetTimeScale()); }
    catch(e) { this.invokeLater('_setDurationFromQTVideoObject',100); }
  },
  
  _setDimensionsFromQTVideoObject: function(vid) {
    if(!vid) vid = this._getVideoObject();
    try{
      var dimensions=vid.GetRectangle().split(',');
      this.set('videoWidth', dimensions[2]);
      this.set('videoHeight', dimensions[3]);
    } catch(e) { this.invokeLater('_setDimensionsFromQTVideoObject',100); }
  },
  
  /** 
     For Quicktime we need to simulated the timer as there is no data,
     coming back from the plugin that reports back the currentTime of the 
     video.

     @returns {void}
   */
  _qtTimer:function(){
    if(this.loaded==='quicktime' && !this.get('paused')){
      this.incrementProperty('currentTime');
      this.invokeLater(this._qtTimer, 1000);
    }
  }.observes('paused'),
  
  /** 
    Called when currentTime changes. Notifies the differnt technologies 
    then new currentTime.
    
    @returns {void}
  */
  seek:function(){
    var timeInSecs, totaltimeInSecs, formattedTime, vid=this._getVideoObject();
    if(this.loaded==='html5'){
      if(this.get('paused')) vid.currentTime=this.get('currentTime');
    }
    if(this.loaded==='quicktime'){
      if(this.get('paused')) vid.SetTime(this.get('currentTime')*vid.GetTimeScale());
    }
    if(this.loaded==='flash'){
      if(this.get('paused')) vid.setTime(this.get('currentTime'));
    }
  }.observes('currentTime'),
  
  /** 
    Should be called once the progress view is clicked to stop the event and
    later start seeking.
    
    @returns {void}
  */
  startSeek: function(){
    if(!this.get('paused')) {
      console.log('startseetk');
      this.stop();
      this._wasPlaying = true;
    }
  },
  
  /** 
    Should be called once the progress view gets a mouseUp. It will get the
    player to continue playing if it was playing before starting the seek.
    
    @returns {void}
  */
  endSeek: function(){
    if(this._wasPlaying) {
      console.log('startseetk');
      this.play();
      this._wasPlaying = false;
    }
  },
  
  
  /** 
    Set the volume of the video.
    
    @returns {void}
  */
  setVolume:function(){
    var vid=this._getVideoObject();
    if(this.loaded==="html5") vid.volume=this.get('volume');
    if(this.loaded==="quicktime") vid.SetVolume(this.get('volume')*256);
    if(this.loaded==="flash") vid.setVolume(this.get('volume'));
  }.observes('volume'),
  
  /** 
    Calls the right play method depending on the technology.
    @returns {void}
  */
  play: function(){
    try{
      var vid=this._getVideoObject();
      if(this.loaded==="html5") vid.play();
      if(this.loaded==="quicktime") vid.Play();
      if(this.loaded==="flash") vid.playVideo();
      this.set('paused', NO);
    }catch(e){
      console.warn('The video cannot play!!!! It might still be loading the plugging');
    }
  },
  
  /** 
    Calls the right stop method depending on the technology.
    @returns {void}
  */
  stop: function(){
    var vid=this._getVideoObject();
    if(this.loaded==="html5")  vid.pause();
    if(this.loaded==="quicktime")  vid.Stop();
    if(this.loaded==="flash")  vid.pauseVideo();
    this.set('paused', YES);
  },
  
  /** 
    Plays or stops the video.
    @returns {void}
  */
  playPause: function(){
    if(this.get('paused')){
      this.play();
    }else{
      this.stop();
    }   
  },
   
  /** 
    Goes into fullscreen mode if available
    @returns {void}
  */ 
  fullScreen: function(){
    var vid=this._getVideoObject();
    if(this.loaded==="html5") this.$('video')[0].webkitEnterFullScreen();
    if(this.loaded==="flash") vid.fullScreen();
    return; 
  },
  
  /** 
    Enables captions if available
    @returns {void}
  */
  closedCaption:function(){
    if(this.loaded==="html5"){
      try{
        if(this.get('captionsEnabled')){
          if(this._closedCaptionTrackIndex){
            this.SetTrackEnabled(this._closedCaptionTrackIndex,true);
            this.set('captionsEnabled', YES);
          }
        }else{
          this.SetTrackEnabled(this._closedCaptionTrackIndex,false);
          this.set('captionsEnabled', NO);
        }   
      }catch(a){}
    }
    return;
  },
  
  /*private*/
  
  
  /** 
    Gets the right video object depending on the browser.
    @returns {void}
  */
  _getVideoObject:function(){
    if(this.loaded==="html5") return this.get('videoObject');
    if(this.loaded==="quicktime") return document['qt_'+SC.guidFor(this)];
    if(this.loaded==="flash") {
      var movieName='flash_'+SC.guidFor(this);
      if (window.document[movieName]) 
      {
        return window.document[movieName];
      }
      if (navigator.appName.indexOf("Microsoft Internet")==-1)
      {
        if (document.embeds && document.embeds[movieName]) {
          return document.embeds[movieName]; 
        }
      }
      else
      {
        return document.getElementById(movieName);
      }
    }
  },
  
  _addZeros:function(value){
    if(value.toString().length<2) return "0"+value;
    return value;
  }
  
});

/** 
  Hash to store references to the different flash videos.
*/
SC.VideoView.flashViews={};

/**
  Adds the flash view to the flashViews hash.
*/
SC.VideoView.addToVideoFlashViews = function(view) {
  SC.VideoView.flashViews[SC.guidFor(view)]=view;
} ;

/**
  This function is called from flash to update the properties of the corresponding
  flash view.
*/
SC.VideoView.updateProperty = function(scid, property, value) {
  var view = SC.VideoView.flashViews[scid];
  if(view){
    SC.RunLoop.begin();
    //console.log("setting property from flash"+property+","+value);
    view.set(property, value);
    SC.RunLoop.end();
  }
} ;

/**
  Function to log events coming from flash.
*/
SC.VideoView.logFlash = function(message) {
  console.log("FLASHLOG: "+message);
} ;


SC.VideoPlayerView = SC.View.extend({
  classNames: 'sc-video-player-view',
  
  childViews: 'videoView regular'.w(),
  
  value: null,
  
  degradeList: null,
  
  videoView:SC.VideoView.design({
    layout: { top: 0, bottom:20, right:0, left:0},
    degradeListBinding: '*parentView.degradeList',
    valueBinding: '*parentView.value'
  }),
  
  regular: SC.MediaControlsView.design({
     layout: { bottom:0, left: 0, right: 0, height: 20 },
     targetBinding: '*parentView.videoView'
   }),

  mini: SC.MiniMediaControlsView.design({
     layout: { bottom:0, left: 0, right: 0, height: 20 },
     targetBinding: '*parentView.videoView'
   })
});

