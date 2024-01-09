$(document).ready(function() {


    // GLOBAL DATA ///////////////////////////////////////////////////////////////////////////////////////////////////

    let grandTotal = 0;
    let grandCount = 0;

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
        }else{
            output = {}
        }
        return output;
    }  

    function updateLocalStorageData(sourceObject, appendObject){

        Object.assign(sourceObject, appendObject);
        localStorage.setItem("checklist_progress_data", JSON.stringify(sourceObject));
    }

    function updateNavItemCount(navItemID, value){

        let $navItem = $("[ck-nav-item='" + navItemID + "']");
        if($navItem){
            $navItem.find(".checks-progress_tracker .checks-progress_counter").text(value);            
        }
    }

    function updateAllNavCounts(object){

        $.each( object, function( k, v ) {

            let count = 0;
            $.each( v, function( ik, iv ) {
                if(iv.checked == true){
                    count++;
                }
            });
            // Add count to grand count
            grandCount = grandCount + count;
            // Add count to nav item -> if top of count, show icon
            updateNavItemCount(k, count);
            // Show completed icon if reached total
            let $thisNavItem = $("[ck-nav-item='" + k + "']")
            let thisTotal = $thisNavItem.find(".checks-progress_tracker .checks-progress_total").text();
            
            if (count == thisTotal){
                $thisNavItem.addClass("completed");
            }else{
                $thisNavItem.removeClass("completed");
            }
        });
    }

    function updateProgressBar(){
        
        // Bar width
        $(".checks-progress_bar-fill").css("width", (grandCount * 100 / grandTotal) + "%");
        // Bar count
        $("#checksProgress .checks-progress_counter").text(grandCount);
        $("#checksProgress .checks-progress_total").text(grandTotal);
        let $barProgressTracker = $("#checksProgress .checks-progress_wrapper");
        if (grandCount == grandTotal){
            $barProgressTracker.addClass("completed");
        }else{
            $barProgressTracker.removeClass("completed");
        }
        // Reset grandCount after each update of the bar
        grandCount = 0; 

    }


    // EVENTS //////////////////////////////////////////////////////////////////////////////////////////////////////////
    
    // On document load //////////////////////////////////
        
        // Populate left navigation with totals
        let totalChildren = $('.totals-wrapper').children();
        // Side nav totals
        $.each( totalChildren, function( k, v ) {
            let $v = $(v);
            let id = $v.attr("ck-total");
            let childTotal = $v.find(".w-dyn-item").length;
            if (childTotal > 0){
                $("[ck-nav-item='" + id + "']").find(".checks-progress_tracker .checks-progress_total").text(childTotal);
            }     
            grandTotal = grandTotal + childTotal;       
        });

        // If URL has "checked" parameter -> save as localStorage
        var urlParams = new URLSearchParams(window.location.search);
        if(urlParams.has("checked")){
            let decodedURI = decodeURI(urlParams.get("checked"));
            decodedURI = decodedURI.replace(/%3A/g,":");
            decodedURI = decodedURI.replace(/%2C/g,",");
            let paramJSON = JSON.parse(decodedURI);
            if (paramJSON != null){
                // set localstorage data, sourced from query param
                updateLocalStorageData({}, paramJSON);
                // remove query params -> to avoid a refresh that overrides the new progress with the old params object
                location.replace(location.pathname);
            }
        }

        let initLocalData = getLocalStorageData();
       
        // Populate left navigation with checked item count
        updateAllNavCounts(initLocalData);

        // Populate Progress bar total
        updateProgressBar();

        // Populate page -> if it has an avail list
        if (getPageItems()){
            // Try to locate existing object
            $.each( initLocalData, function( pk, obj ) {
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
            
            // IMPORTANT: Add delay because of other external logic that checks the "checkbox" UI
            setTimeout(function(){
                let availItems = updatePageItemsObject();
                if( availItems ){
                    let localData = getLocalStorageData();
                    updateLocalStorageData(localData, availItems);
                    updateAllNavCounts(localData);
                    updateProgressBar();
                }
            }, 100);
        });

    // On "Share link" item click ///////////////////////////////

        // Clipboard logic
        const clipboard = new ClipboardJS("#share-link-btn", {
            text: function () {
                const url = new URL(window.location);
                url.searchParams.set("checked", encodeURIComponent(JSON.stringify(getLocalStorageData())) );
                return url.toString();
            }
        });
        clipboard.on("success", function (e) {
            $(e.trigger).addClass("copied");
            setTimeout(function(){
                $(e.trigger).removeClass("copied");
            }, 2000);
        });
        clipboard.on("error", function (e) {
            console.log(e);
        });

    // On "Reset progress" item click ////////////////////////////
    $("#reset-progress-btn").on("click", function(){
        const confirmDelete = confirm("Reset all checklist task progress? Warning: This can't be undone.");
        if (confirmDelete){
            updateLocalStorageData({}, {});
            location.reload();
        }
    });

});
