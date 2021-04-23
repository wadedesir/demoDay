document.querySelector('#searchBtnArtist').addEventListener('click', searchArtist)
document.querySelector('#searchBtnTrack').addEventListener('click', searchTrack)

let artistSeeds = [] //selected seeds that will be sent to DB
let trackSeeds = [] 
let activeSearch = { //current searches to be dislayed
    artist : [],
    track : []
}

async function searchArtist(){
    let searchResults
    let searchQuery = document.querySelector('.artistSearch').value
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
        displaySearch(searchResults, true)
    }else{
        alert("That name did not return any results. Please try another")
    }

  }

async function searchTrack(){
    let searchResults
    let searchQuery = document.querySelector('.trackSearch').value
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
        displaySearch(searchResults, false)
    }else{
        alert("That name did not return any results. Please try another")
    }
}

function displaySearch(searchResults, artist){
    let displays = document.querySelectorAll('.searchDisplay')
    let artistName = document.querySelectorAll('.artistName')
    console.log(displays);

    if(artist){
        for(let i = 0; i < 3; i++){
            // displays[i].addEventListener('click', _ => addData(searchResults[i].uri, artist, searchResults) )
            displays[i].onClick = addData(searchResults[i].uri, artist, searchResults)
            displays[i].style.backgroundImage = `url(${searchResults[i].images[0].url})` 
            artistName[i].innerText = searchResults[i].name
        }
    }else{
        for(let i = 0; i < 3; i++){
            displays[i].addEventListener('click', _ => addData(searchResults[i].uri, artist, searchResults) )
            displays[i].style.backgroundImage = `url(${searchResults[i].album.images[0].url})` 
            artistName[i].innerText = searchResults[i].name
        }
    }

}

function addData(uri, artist, searchResults){
    let displays = document.querySelectorAll('.searchDisplay')
    let artistName = document.querySelectorAll('.artistName')
    data = uri.slice(uri.lastIndexOf(':') + 1)
    if (artist){
        for(let i = 0; i < 3; i++){
            displays[i].removeEventListener('click', _ => addData(searchResults[i].uri, artist, searchResults) )
            // display[i].removeEventListener('click', _ => addData(searchResults[i].uri) )
            displays[i].style.backgroundImage = `` 
            artistName[i].innerText = ""
        }
        artistSeeds.includes(data) ? true : artistSeeds.push(data)
    }else{
        for(let i = 0; i < 3; i++){
            displays[i].removeEventListener('click', _ => addData(searchResults[i].uri, artist, searchResults))
            // display[i].removeEventListener('click', _ => addData(searchResults[i].uri) )
            displays[i].style.backgroundImage = `` 
            artistName[i].innerText = ""
        }
        trackSeeds.includes(data) ? true : trackSeeds.push(data)
    }

    console.log(artistSeeds, "tracks" + trackSeeds);

}

