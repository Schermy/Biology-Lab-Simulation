(function(){var a="sproutcore/standard_theme";if(!SC.BUNDLE_INFO){throw"SC.BUNDLE_INFO is not defined!"
}if(SC.BUNDLE_INFO[a]){return}SC.BUNDLE_INFO[a]={requires:["sproutcore/empty_theme"],styles:["/static/sproutcore/standard_theme/es/8b65428a7dcfa2226586b487bde1bf11560de2aa/stylesheet-packed.css","/static/sproutcore/standard_theme/es/8b65428a7dcfa2226586b487bde1bf11560de2aa/stylesheet.css"],scripts:["/static/sproutcore/standard_theme/es/8b65428a7dcfa2226586b487bde1bf11560de2aa/javascript-packed.js"]}
})();SC.stringsFor("English",{"Kind.app":"Apps","Kind.framework":"Frameworks","Kind.sproutcore":"SproutCore","_Test Runner":"Test Runner","_No Targets":"No Targets","_No Tests":"No Tests","_Loading Targets":"Loading Targets","_No Target Selected":"No Target Selected","_Loading Tests":"Loading Tests","_Window Title":"Test Runner - %@","_No Target":"No Target"});
TestRunner=SC.Application.create({NAMESPACE:"TestRunner",VERSION:"0.1.0",store:SC.Store.create().from("CoreTools.DataSource"),targets:function(){return this.get("store").find(CoreTools.TARGETS_QUERY)
}.property().cacheable(),trace:NO,userDefaults:SC.UserDefaults.create({userDomain:"anonymous",appDomain:"SC.TestRunner"}),route:{},routePending:NO,computeRouteTarget:function(){var a=this.get("route").target;
if(!a){return null}else{return TestRunner.targetsController.findProperty("name",a)
}},computeRouteTest:function(){var a=this.get("route").test;if(!a){return null}else{return TestRunner.testsController.findProperty("filename",a)
}},routeDidChange:function(a){if(!a.target){return NO}a=SC.clone(a);if(a.target){a.target="/"+a.target
}if(a.test){a.test="tests/"+a.test}this.set("route",a);this.set("routePending",YES);
this.trace=YES;this.sendAction("route",this,a);this.trace=NO;return YES},updateRoute:function(b,e,d){var a=this.get("route"),c;
if(d||((b===a.target)&&(e===a.test))){this.set("routePending",NO)}if(!this.get("routePending")){if(b){b=b.get("name")
}if(e){e=e.get("filename")}c=b?b.slice(1):"";if(e){c="%@&test=%@".fmt(c,e.slice(6))
}SC.routes.setIfChanged("location",c)}}});SC.routes.add("*target",TestRunner,TestRunner.routeDidChange);
TestRunner.detailController=SC.ObjectController.create({uncachedUrl:function(){var a=this.get("url");
return a?[a,Date.now()].join("?"):a}.property("url")});TestRunner.sourceController=SC.TreeController.create({contentBinding:"TestRunner.targetsController.sourceRoot",treeItemChildrenKey:"children",treeItemIsExpandedKey:"isExpanded",treeItemIsGrouped:YES,allowsMultipleSelection:NO,allowsEmptySelection:NO,sidebarThickness:200});
TestRunner.targetController=SC.ObjectController.create({contentBinding:"TestRunner.sourceController.selection",nameDidChange:function(){var a=this.get("name");
if(a){a=a.slice(1)}document.title="_Window Title".loc(a||"_No Target".loc())}.observes("name")});
TestRunner.targetsController=SC.ArrayController.create({reload:function(){var a=TestRunner.store.find(CoreTools.TARGETS_QUERY);
this.set("content",a)},sourceRoot:function(){var c={},e=[],d,a,b;this.forEach(function(f){if(d=f.get("sortKind")){a=c[d];
if(!a){c[d]=a=[]}a.push(f);if(e.indexOf(d)<0){e.push(d)}}},this);e.sort();if(e.indexOf("sproutcore")>=0){e.removeObject("sproutcore").pushObject("sproutcore")
}if(e.indexOf("apps")>=0){e.removeObject("apps").unshiftObject("apps")}b=[];e.forEach(function(h){a=c[h];
var g="SourceList.%@.isExpanded".fmt(h),f=TestRunner.userDefaults.get(g);b.push(SC.Object.create({displayName:"Kind.%@".fmt(h).loc(),isExpanded:SC.none(f)?(h!=="sproutcore"):f,children:a.sortProperty("kind","displayName"),isExpandedDefaultKey:g,isExpandedDidChange:function(){TestRunner.userDefaults.set(this.get("isExpandedDefaultKey"),this.get("isExpanded"))
}.observes("isExpanded")}))});return SC.Object.create({children:b,isExpanded:YES})
}.property("[]").cacheable(),statusDidChange:function(){TestRunner.sendAction("targetsDidChange")
}.observes("status")});TestRunner.targetsController.addProbe("state");TestRunner.testsController=SC.ArrayController.create({contentBinding:"TestRunner.targetController.tests",useContinuousIntegration:NO,isShowingTests:YES,statusDidChange:function(){TestRunner.sendAction("testsDidChange")
}.observes("status")});TestRunner.NO_TARGETS=SC.Responder.create({didBecomeFirstResponder:function(){TestRunner.set("currentScene","noTargets");
TestRunner.updateRoute(null,null,YES)},willLoseFirstResponder:function(){TestRunner.set("currentScene",null)
}});TestRunner.READY=SC.Responder.create({selectTarget:function(a,c){if(c&&c.isEnumerable){c=c.firstObject()
}TestRunner.sourceController.selectObject(c);if(c){var b=c.get("tests");if(b&&(b.get("status")&SC.Record.BUSY)){TestRunner.makeFirstResponder(TestRunner.READY_LOADING)
}else{if(!b||(b.get("length")===0)){TestRunner.makeFirstResponder(TestRunner.READY_NO_TESTS)
}else{TestRunner.makeFirstResponder(TestRunner.READY_LIST)}}}else{TestRunner.makeFirstResponder(TestRunner.READY_EMPTY)
}},selectTest:function(a,b){if(!TestRunner.targetController.get("hasContent")){return NO
}if(b&&b.isEnumerable){b=b.firstObject()}TestRunner.detailController.set("content",b);
TestRunner.set("routeName",b?b.get("filename"):null);if(b){TestRunner.makeFirstResponder(TestRunner.READY_DETAIL)
}else{TestRunner.makeFirstResponder(TestRunner.READY_LIST)}},route:function(a,c){var b=TestRunner.computeRouteTarget(),d=TestRunner.computeRouteTest();
if(d){TestRunner.sendAction("selectTest",this,d)}else{TestRunner.sendAction("selectTarget",this,b)
}}});sc_require("states/ready");TestRunner.READY_DETAIL=SC.Responder.create({nextResponder:TestRunner.READY,didBecomeFirstResponder:function(){TestRunner.set("currentScene","testsDetail");
var a=TestRunner.sourceController.get("selection").firstObject();var b=TestRunner.detailController.get("content");
TestRunner.updateRoute(a,b,YES)},willLoseFirstResponder:function(){TestRunner.set("currentScene",null)
},back:function(){TestRunner.detailController.set("content",null);TestRunner.makeFirstResponder(TestRunner.READY_LIST)
}});sc_require("states/ready");TestRunner.READY_EMPTY=SC.Responder.create({nextResponder:TestRunner.READY,didBecomeFirstResponder:function(){TestRunner.set("currentScene","testsNone");
TestRunner.updateRoute(null,null,NO);if(TestRunner.get("routePending")){var a=TestRunner.computeRouteTarget();
if(a){TestRunner.sendAction("selectTarget",this,a)}else{TestRunner.updateRoute(null,null,YES)
}}},willLoseFirstResponder:function(){TestRunner.set("currentScene",null)},route:function(a,b){TestRunner.set("routeTarget",b.target);
TestRunner.set("routeTest",b.test)}});sc_require("states/ready");TestRunner.READY_LIST=SC.Responder.create({nextResponder:TestRunner.READY,didBecomeFirstResponder:function(){TestRunner.set("currentScene","testsMaster");
TestRunner.testsController.set("selection",null);var a=TestRunner.sourceController.get("selection").firstObject();
TestRunner.updateRoute(a,null,NO);if(TestRunner.get("routePending")){var b=TestRunner.computeRouteTest();
if(b){TestRunner.sendAction("selectTest",this,b)}else{TestRunner.updateRoute(a,null,YES)
}}},willLoseFirstResponder:function(){TestRunner.set("currentScene",null)}});sc_require("states/ready");
TestRunner.READY_LOADING=SC.Responder.create({nextResponder:TestRunner.READY,didBecomeFirstResponder:function(){this._timer=this.invokeLater(this._showTestsLoading,150)
},_showTestsLoading:function(){this._timer=null;TestRunner.set("currentScene","testsLoading")
},willLoseFirstResponder:function(){if(this._timer){this._timer.invalidate()}TestRunner.set("currentScene",null)
},testsDidChange:function(a){var b=TestRunner.testsController;if(!(b.get("status")&SC.Record.READY)){return NO
}if(b.get("length")===0){TestRunner.makeFirstResponder(TestRunner.READY_NO_TESTS)
}else{TestRunner.makeFirstResponder(TestRunner.READY_LIST)}}});TestRunner.READY_NO_TESTS=SC.Responder.create({nextResponder:TestRunner.READY,didBecomeFirstResponder:function(){TestRunner.set("currentScene","noTests");
var a=TestRunner.sourceController.get("selection").firstObject();TestRunner.updateRoute(a,null,YES)
},willLoseFirstResponder:function(){TestRunner.set("currentScene",null)}});TestRunner.START=SC.Responder.create({didBecomeFirstResponder:function(){TestRunner.set("currentScene","targetsLoading");
TestRunner.targetsController.reload()},willLoseFirstResponder:function(){TestRunner.set("currentScene",null)
},targetsDidChange:function(){if(TestRunner.getPath("targets.status")!==SC.Record.READY_CLEAN){return NO
}var a=TestRunner.getPath("targets.length")>0;if(a){TestRunner.makeFirstResponder(TestRunner.READY_EMPTY)
}else{TestRunner.makeFirstResponder(TestRunner.NO_TARGETS)}return YES}});TestRunner.OffsetCheckboxView=SC.CheckboxView.extend({offset:0,offsetDidChange:function(){this.adjust("left",this.get("offset")+6)
}.observes("offset")});sc_require("views/offset_checkbox");TestRunner.mainPage=SC.Page.design({mainPane:SC.MainPane.design({defaultResponder:"TestRunner",childViews:"splitView toolbarView".w(),splitView:SC.SplitView.design({layout:{left:0,top:0,right:0,bottom:32},defaultThickness:200,topLeftThicknessBinding:"TestRunner.sourceController.sidebarThickness",topLeftView:SC.ScrollView.design({hasHorizontalScroller:NO,contentView:SC.SourceListView.design({contentBinding:"TestRunner.sourceController.arrangedObjects",selectionBinding:"TestRunner.sourceController.selection",contentValueKey:"displayName",hasContentIcon:YES,contentIconKey:"targetIcon",action:"selectTarget"})}),bottomRightView:SC.SceneView.design({scenes:"testsMaster testsDetail".w(),nowShowingBinding:"TestRunner.currentScene"})}),toolbarView:SC.ToolbarView.design({anchorLocation:SC.ANCHOR_BOTTOM,childViews:"logo continuousIntegrationCheckbox runTestsButton".w(),classNames:"bottom-toolbar",logo:SC.View.design({layout:{left:0,top:0,bottom:0,width:200},classNames:"app-title",tagName:"h1",render:function(a,c){var b="/static/sproutcore/foundation/es/757bdc6c237186fc87cf1b608e6dceb70c4542b6/images/sproutcore-logo.png";
a.push('<img src="%@" />'.fmt(b));a.push("<span>","_Test Runner".loc(),"</span>")
}}),continuousIntegrationCheckbox:TestRunner.OffsetCheckboxView.design({title:"Continuous Integration",offsetBinding:"TestRunner.sourceController.sidebarThickness",valueBinding:"TestRunner.testsController.useContinuousIntegration",isEnabledBinding:"TestRunner.testsController.isShowingTests",layout:{height:18,centerY:1,width:170,left:206}}),runTestsButton:SC.ButtonView.design({title:"Run Tests",isEnabledBinding:"TestRunner.testsController.isShowingTests",layout:{height:24,centerY:0,width:90,right:12}})})}),targetsLoading:SC.View.design({childViews:"labelView".w(),labelView:SC.LabelView.design({layout:{centerX:0,centerY:0,height:24,width:200},textAlign:SC.ALIGN_CENTER,controlSize:SC.HUGE_CONTROL_SIZE,classNames:"center-label",controlSize:SC.LARGE_CONTROL_SIZE,fontWeight:SC.BOLD_WEIGHT,value:"_Loading Targets".loc()})}),noTargets:SC.View.design({childViews:"labelView".w(),labelView:SC.LabelView.design({layout:{centerX:0,centerY:0,height:24,width:200},textAlign:SC.ALIGN_CENTER,classNames:"center-label",controlSize:SC.LARGE_CONTROL_SIZE,fontWeight:SC.BOLD_WEIGHT,value:"_No Targets".loc()})}),noTests:SC.View.design({childViews:"labelView".w(),labelView:SC.LabelView.design({layout:{centerX:0,centerY:0,height:24,width:200},textAlign:SC.ALIGN_CENTER,classNames:"center-label",controlSize:SC.LARGE_CONTROL_SIZE,fontWeight:SC.BOLD_WEIGHT,value:"_No Tests".loc()})}),testsLoading:SC.View.design({childViews:"labelView".w(),labelView:SC.LabelView.design({layout:{centerX:0,centerY:0,height:24,width:200},textAlign:SC.ALIGN_CENTER,classNames:"center-label",controlSize:SC.LARGE_CONTROL_SIZE,fontWeight:SC.BOLD_WEIGHT,value:"_Loading Tests".loc()})}),testsNone:SC.View.design({childViews:"labelView".w(),labelView:SC.LabelView.design({layout:{centerX:0,centerY:0,height:24,width:200},textAlign:SC.ALIGN_CENTER,classNames:"center-label",controlSize:SC.LARGE_CONTROL_SIZE,fontWeight:SC.BOLD_WEIGHT,value:"_No Target Selected".loc()})}),testsMaster:SC.ScrollView.design({hasHorizontalScroller:NO,contentView:SC.ListView.design({contentBinding:"TestRunner.testsController.arrangedObjects",selectionBinding:"TestRunner.testsController.selection",classNames:["test-list"],rowHeight:32,hasContentIcon:YES,contentIconKey:"icon",hasContentBranch:YES,contentIsBranchKey:"isRunnable",contentValueKey:"displayName",actOnSelect:YES,action:"selectTest"})}),testsDetail:SC.View.design({childViews:"navigationView webView".w(),navigationView:SC.ToolbarView.design({classNames:"navigation-bar",layout:{top:0,left:0,right:0,height:32},childViews:"backButton locationLabel".w(),backButton:SC.ButtonView.design({layout:{left:8,centerY:0,width:80,height:24},title:"« Tests",action:"back"}),locationLabel:SC.LabelView.design({layout:{right:8,centerY:-2,height:16,left:100},textAlign:SC.ALIGN_RIGHT,valueBinding:"TestRunner.detailController.displayName"})}),webView:SC.WebView.design({layout:{top:33,left:2,right:0,bottom:0},valueBinding:SC.Binding.oneWay("TestRunner.detailController.uncachedUrl")})})});
TestRunner.main=function main(){TestRunner.getPath("mainPage.mainPane").append();
TestRunner.makeFirstResponder(TestRunner.START)};function main(){TestRunner.main()
};