(()=>{
    //-----------------------------------------------------------------------------
    // Enviroment Constants
    //-----------------------------------------------------------------------------
 
    const BANNERRENEWAL = '100000';
    const BANNERFORMATS = {method: 'GET', url:'http://localhost/adserver/public/api/bannertypes'};
    const NEWBANNER = {method: 'POST', url:'http://localhost/adserver/public/api/loadad'};



    //-----------------------------------------------------------------------------
    // Server Connection 
    //-----------------------------------------------------------------------------

        function askServerFor(connection,requestedBanner){

            return new Promise(function(resolve,reject){
                let request = new XMLHttpRequest();
                request.open(connection.method, connection.url);

                if(connection.method === 'POST'){
                    request.setRequestHeader('Content-Type', 'application/json');
                }

                request.onload = function() {

                    if (request.status === 200) {
                        resolve(JSON.parse(request.responseText)); //resolve the Promise

                    } else {
                        reject(Error(request.statusText)); //if not 200 OK, reject.
                    }
                };
        
                request.onerror = function() {
                    reject(Error('Error fetching data.')); //error occurred, reject the Promise
                };
        
                request.send(JSON.stringify(requestedBanner));
            });         
        }



    //-----------------------------------------------------------------------------
    // Helper Methods
    //-----------------------------------------------------------------------------

    function sanityCheckForAds(availableBanner, declaredBanner){
        let validBanners = [];

        declaredBanner.forEach((element) => {
           let bannerString = JSON.stringify(element);
           availableBanner.forEach((element2) => {

                if(bannerString === JSON.stringify(element2)){
                       validBanners.push(element);
                }  
           });
        });
        return validBanners;
    }

    function findDeclaredAdsInHTML(){
        let usedBanner = Array.from(document.querySelectorAll('[class^=ad-]'));
        let declaredAds = [];
        let date = new Date();

        usedBanner.forEach((element) =>{
            let adObj = {};
            let tempAdObj = element.className.split('-');
            
            //build a transport Object
            adObj.width = tempAdObj[1];
            adObj.height = tempAdObj[2];
            adObj.position = tempAdObj[3];
            adObj.hour = date.getHours().toString();

            declaredAds.push(adObj);
        });

        return declaredAds;
    }

    function setBannerToHTML(banners){
        banners.forEach((element) =>{
            let bannerOftheSameType = Array.from(document.querySelectorAll('.ad-' + element.width + '-' + element.height + '-' + element.pos));
            
            bannerOftheSameType.forEach((element2) =>{
                element2.href = element.link;
                element2.firstChild.src = element.image;
            });
        });
    }



    //-----------------------------------------------------------------------------
    // Main Loop
    //-----------------------------------------------------------------------------
    
    function startAdClient(){

        // Feature detection
        if( !window.XMLHttpRequest || !window.Promise){
            console.error('Your Browser needs support for XMLHttpRequest and Promises');
            return;
        };

        //fetch Banner Dimensions 
        askServerFor(BANNERFORMATS).then(function(availableFormats){
            //Testbanner: use it instead of findDeclaredAdsInHTML()
            //let let temp = [{width: 728, height: 90, position: 2, hour:15},{width: 300, height: 600, position: 2, hour:8}];

            //Get Banner from Server
            askServerFor(NEWBANNER, sanityCheckForAds(availableFormats, findDeclaredAdsInHTML())).then(function(freshbanner){
                console.log(freshbanner);
                setBannerToHTML(freshbanner);

            },function(error){
                console.log(error.message);
            });

        },function(error){
            console.log(error.message);
        });

        setInterval(startAdClient, BANNERRENEWAL);
    }

    startAdClient();
     
})();

