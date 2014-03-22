/*
 * Example Code for Toolbar Button Complete by user213 (Geek in Training) 
 *    modified version of Toolbar Button (with popup menu) by globex-designs
 *
 * Authors : Evgueni Naverniouk (evgueni@globexdesigns.com), user213 (GoMobileFirefox@gmail.com)
 * 
 */

// just testing a modified copy (azrafe7)
var menu,t;
var button;
var toolbarbutton = require("toolbarbutton");
var data = require("self").data;

// createButton()
// Creates the add-on toolbar button
// 
// @return object
function createButton(options) {
/* Start Menu */
    var menu = {
        id: 'MyAddon-menupopup',
        onShow: function() { console.log("menu onShow"); },     // not working?
        onHide: function() { console.log("menu onHide"); },     // not working?
        position: 'after_start',
        items: [
            {
                id: 'MyAddon-menupopup-1',
                label: 'Item 1',
                tooltiptext: 'Toogle Item 1',
                type: 'radio',
                checked: true,
                onCommand: function() {                         /*but button.onCommand gets called before also (In other words, the onCommand for the toolbar button will be called first, and then the onCommand for the menuitem will be called second)*/
                    console.log("item 1 selected");
                }
            },{
                id: "MyAddon-menupopup-2",
                label: "Item 2",
                type: "radio",
                disabled: true,
                onCommand: function() {
                    console.log("item 2 selected");
                }
            },{
                id: "myAddon-menupopup-3",
                label: "item 3",
                type: "radio"
            },{
                Id: "MyAddon-menupopup-4",
                label: "Item 4",
                image: data.url("mozilla.png")
            },
            
            null,  // Menu Separator ___________________________________________
            
            {
                id: 'MyAddon-menupopup-3',
                label: 'a submenu',
                tooltiptext: 'a submenu',
                type: "menu",
                items: [
                {
                    id: "MyAddon-menupopup-submenu-item1",
                    label: "Submenu item 1 (checkable)",
                    type: "checkbox",
                    checked: false
                },{
                    id: "MyAddon-menupopup-submenu-item2",
                    label: "Submenu item 2 (checkable)",
                    type: "checkbox",
                    checked: false
                },
                
                null,  // Menu Separator _______________________________________
                
                {
                    id: "MyAddon-menupopup-submenu-submenu",
                    label: "another submenu",
                    type: "menu",
                    items: [
                        {
                            id: "MyAddon-menupopup-submenu-submenu-item1",
                            label: "another submenu item1 (checkable)",
                            type: "checkbox",
                            checked: true
                        }
                    ]
                }
                ]
            }
        ]
    }
/* End Menu */

    return toolbarbutton.ToolbarButton({
        id: "MyAddon",
        label: "My Addon",
        tooltiptext: "My Addon Tooltip",
        image: data.url("favicon.png"),
        menu: menu,
        onCommand: function() {
            console.log("Addon Button Clicked");
            button.button().setAttribute('image', data.url("mozilla.png")); // Change the button's icon
        }
    });
}


exports.main = function(options) {
    button = createButton(options);
    
    // On install moves button into the toolbar
    if (options.loadReason == "install") {
        button.moveTo({
            toolbarID: "nav-bar",
            forceMove: false
        });
    }

    // Change the button's icon
    //button.button().setAttribute('image', data.url("favicon.png"));
};