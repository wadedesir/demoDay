document.querySelector('#searchBtnArtist').addEventListener('click', searchArtist)
document.querySelector('#searchBtnTrack').addEventListener('click', searchTrack)
document.querySelector('#submit').addEventListener('click', submitSongs)

let artist //?
let artistSeeds = [] //selected seeds that will be sent to DB
let trackSeeds = [] 
let addedFeatures = 0

let displays = document.querySelectorAll('.searchDisplay')
let artistName = document.querySelectorAll('.artistName')

displays.forEach(display =>{
    display.addEventListener('click', addData)
})

async function searchArtist(){
    let searchResults
    let searchQuery = document.querySelector('.artistSearch').value
    if(searchQuery === ""){ return alert("please enter a query") }
    console.log(searchQuery)
    const search = await fetch(`/search?artist=${searchQuery}"`);
    
    if (search.ok) { // if HTTP-status is 200-299
        // get the response body (the method explained below)
    searchResults = await search.json();
    console.log(searchResults)
    } else {
    console.log("HTTP-Error: " + search.status);
    }

    if (searchResults){
        artist = true
        displaySearch(searchResults)
    }else{
        alert("That name did not return any results. Please try another")
    }

  }

async function searchTrack(){
    let searchResults
    let searchQuery = document.querySelector('.trackSearch').value
    if(searchQuery === ""){ return alert("please enter a query") }
    console.log(searchQuery)
    const search = await fetch(`/search?track=${searchQuery}`);

    if (search.ok) { // if HTTP-status is 200-299
        // get the response body (the method explained below)
    searchResults = await search.json();
    console.log(searchResults)
    } else {
    console.log("HTTP-Error: " + search.status);
    }

    if (searchResults){
        artist = false
        displaySearch(searchResults)
    }else{
        alert("That name did not return any results. Please try another")
    }
}

function displaySearch(searchResults){
    // if(!searchResults[i]){

    // }

    if(artist){  
        for(let i = 0; i < 3; i++){
            
            if (searchResults[i].images[0]){
                displays[i].style.backgroundImage = `url(${searchResults[i].images[0].url})`
            }else{
                displays[i].style.backgroundImage = `url(assets/img/spotifyIcon.png)`
            } 
            displays[i].setAttribute('data-uri', `${searchResults[i].id}`) 
            artistName[i].innerText = searchResults[i].name
        }
    }else{
        for(let i = 0; i < 3; i++){
            if (searchResults[i].album.images[0].url){
                displays[i].style.backgroundImage = `url(${searchResults[i].album.images[0].url})` 
            }else{
                displays[i].style.backgroundImage = `url(assets/img/spotifyIcon.png)`
            }
            
            displays[i].setAttribute('data-uri', `${searchResults[i].id}`) 
            artistName[i].innerText = searchResults[i].name
        }
    }

}

function addData(event){
    console.log(event.target.getAttribute('data-uri'))
    data = event.target.getAttribute('data-uri')
    if (data === null){
        alert('Error adding new item. Please try again.')
        return 
    }

    if (addedFeatures <= 10){
        
        if (artist){
            for(let i = 0; i < 3; i++){
                displays[i].style.backgroundImage = `` 
                artistName[i].innerText = ""
                document.querySelector('.artistSearch').value = ''
            }
            artistSeeds.includes(data) ? alert("This artist has already been added") : artistSeeds.push(data)
        }else{
            for(let i = 0; i < 3; i++){
                displays[i].style.backgroundImage = `` 
                artistName[i].innerText = ""
                document.querySelector('.trackSearch').value = ''
            }
    
            trackSeeds.includes(data) ? alert("This song has already been added") : trackSeeds.push(data)
        }
        addedFeatures += 1
    }

    artist = null
    // console.log('artists: ', artistSeeds, 'songs: ', trackSeeds)

}

async function submitSongs(){
    if(trackSeeds.length < 1 || artistSeeds.length < 1){
        alert("Please select provide at least one song and artist.")
        return
    }

    if(addedFeatures >= 5){
        
        let sendData = await fetch(`/seed?artists=${artistSeeds}&tracks=${trackSeeds}`, {method: 'POST'})
        let result = await sendData.json()
        if(result == 'success'){
            console.log('seed success')
            window.location.href = "/onboard";
        }else{
            alert('error sending data to server. Please try again.')
        }
    }else{
        alert('Please make at least 5 selections before moving forward')
    }
    
}
