$(document).ready(function() {
    
    // LOAD BEHAVIOR

        // Check localstorage for JSON

            // If JSON - 
                // Update left navigation counts
                // Check ck-parent and try to match with JSON data

                    // If match -
                        // Locate ck-crawl list
                        // Traverse json and "check" matching items

        // Check if page has available ck-crawl items
            // If match - 
                // Traverse to ck-parent and save slug as ID variable
                    // Check if JSON has ID parent
                        // If not, populate with ck-crawl list and notate items as checked true of false
            
        //Identify ck-crawl items
        //Traverse to parent to build hierarchy


    let ckJSON = {};

    // Check local storage for saved progress data
    let localStorageProgressData = localStorage.getItem("checklist_progress_data");
    if (localStorageProgressData){
        ckJSON = JSON.parse(localStorageProgressData);
    }

    // TODO: Update left nav

    // TODO: Update page items

    // TODO: Check if body has avail ck-items list, to scrape
    let ckItems = $("[ck-items='crawl']");
    if(ckItems != null){
        
        // Check for children to make sure it's a checklist
        let ckItemsChildren = ckItems.find(".cc-task-item");
        if (ckItemsChildren != null && ckItemsChildren.length > 0){
            // Build page object with parent slug, review items for checked and unchecked, add to ckJSON
            let ckParent = $("[ck-parent]");
            if (ckParent != null){
                ckParent = ckParent.attr("ck-parent")
            }
            let pageJSON = {};
            // Traverse children
            ckItemsChildren.each(function( index ) {
                // Get ck-item element
                let ckItem = $(this).find("[ck-item]");
                // Check if it's checked
                // console.log(ckItem.is(':checked'));
                pageJSON.push(JSON.stringify(ckItem.attr("ck-item")));
            });
            console.log(pageJSON);
        }
    }


});