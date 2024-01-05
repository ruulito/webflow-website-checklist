$(document).ready(function() {

    // REUSABLE FUNCTIONS ////////////////////////////////////////////////////////////////////////////////////////////

    function isItemChecked($ckItemEl){ // Make sure to pass [ck-item] element as a JQuery object
        let output = false;
        if ($ckItemEl.find(".w-checkbox-input").hasClass("w--redirected-checked")){
            output = true;
        }
        return output;
    }

    function makeItemChecked($ckItemEl){ // Make sure to pass [ck-item] element as a JQuery object
        $ckItemEl.find(".w-checkbox-input").addClass("w--redirected-checked");
    }

    function getPageItems(){
        let output = false;
        let ckItems = $("[ck-items='crawl']");
        if(ckItems != null){
            // Check for children to make sure it's a checklist
            let ckItemsChildren = ckItems.find(".cc-task-item");
            if (ckItemsChildren != null && ckItemsChildren.length > 0){
                output = ckItemsChildren;
            }
        }
        return output;
    }

    function getPageParentID(){
        let ckParent = $("[ck-parent]");
        if (ckParent != null){
            ckParent = ckParent.attr("ck-parent")
        }
        return ckParent;
    }

    function updatePageItemsObject(){

        let pageJSON;

        // Check if body has avail ck-items list, to scrape
        let ckPageItems = getPageItems();
        if (ckPageItems){

            // Build page object with parent slug, review items for checked and unchecked, add to ckJSON
            let ckParent = getPageParentID();
            pageJSON = {
                [ckParent] : {}
            };
            // Traverse children and push to pageJSON
            ckPageItems.each(function() {
                // Get ck-item element
                let $ckItem = $(this).find("[ck-item]");
                let ckItemKey = $ckItem.attr("ck-item");
                
                let itemRow = {
                    [ckItemKey] : {
                        "checked" : isItemChecked($ckItem) // Check if it's checked or not
                    }
                }
                Object.assign(pageJSON[ckParent], itemRow);
            });

        }
        return pageJSON;
    }

    function getLocalStorageData(){
        let output;
        let localStorageProgressData = localStorage.getItem("checklist_progress_data");
        if (localStorageProgressData){
            output = JSON.parse(localStorageProgressData);
        }
        return output;
    }  

    function updateLocalStorageData(sourceObject, appendObject){
        Object.assign(sourceObject, appendObject);
        localStorage.setItem("checklist_progress_data", JSON.stringify(sourceObject));
    }

    function updateNavItemCount(){

    }

    // EVENTS //////////////////////////////////////////////////////////////////////////////////////////////////////////
    
    // On document load //////////////////////////////////

        // Get localstorage object
        let localJSON = getLocalStorageData();
        if(!localJSON){
            localJSON = {};
        }
        console.log(localJSON);

        // Populate left navigation with all checked items
        $.each( localJSON, function( k, v ) {
            let $navItem = $("[ck-nav-item='" + k + "']");
            let total = 0;
            let count = 0;
            $.each( v, function( ik, iv ) {
                if(iv.checked == true){
                    count++;
                }
                total++;
            });

            // Add count -> if top of count, show icon
            $navItem.find(".checks-progress_tracker .checks-progress_counter").text(count);
            $navItem.find(".checks-progress_tracker .checks-progress_total").text(total);

        });

        // Populate page - if it has an avail list
        if (getPageItems()){
            // Try to locate existing object
            $.each( localJSON, function( pk, obj ) {
                if(pk == getPageParentID()){
                    
                    $.each( obj, function( ck, item ) {                        

                        // Check List UI
                        if( item.checked == true){
                            let $el = $("[ck-item='" + ck + "']");
                            makeItemChecked($el);
                        }
                    });
                    return false; // Exit loop
                }
            });
        }

    // On check item click ///////////////////////////////

        // Update localstorage on checked box interactions
        $("[ck-item]").on("click", function(){

            let ckSelector = $(this).attr("ck-item");
            
            // IMPORTANT: Add delay because of other logic that checks the "checkbox" UI
            setTimeout(function(){
                let availItems = updatePageItemsObject();
                if( availItems ){
                    let localData = getLocalStorageData();
                    if(!localData){
                        localData = {};
                    }
                    updateLocalStorageData(localData, availItems);
                }
            }, 100);
        });

});