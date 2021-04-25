document.querySelector('#searchBtnArtist').addEventListener('click', searchArtist)
document.querySelector('#searchBtnTrack').addEventListener('click', searchTrack)
document.querySelector('.complete').addEventListener('click', submit)
let artist //?
let artistSeeds = [] //selected seeds that will be sent to DB
let trackSeeds = [] 
let activeSearch = { //current searches to be dislayed
    artist : [],
    track : []
}

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


    if(artist){
        for(let i = 0; i < 3; i++){
            // displays[i].addEventListener('click', _ => addData(searchResults[i].uri, artist, searchResults) )
            // displays[i].onClick = addData(this)
            // displays[i].setAttribute('data-uri', `${searchResults[i].uri.slice(uri.lastIndexOf(':') + 1)}`) 
            displays[i].style.backgroundImage = `url(${searchResults[i].images[0].url})` 
            artistName[i].innerText = searchResults[i].name
        }
    }else{
        for(let i = 0; i < 3; i++){
            // displays[i].addEventListener('click', _ => addData(searchResults[i].uri, artist, searchResults) )
            // displays[i].onClick = addData(searchResults[i].uri, artist, searchResults)
            // displays[i].onClick = e => console.log(e.target)
            // displays[i].setAttribute('data-uri', `${searchResults[i].uri.slice(uri.lastIndexOf(':') + 1)}`) 
            // displays[i].dataset.uri = searchResults[i].uri.slice(uri.lastIndexOf(':') + 1)
            displays[i].style.backgroundImage = `url(${searchResults[i].album.images[0].url})` 
            artistName[i].innerText = searchResults[i].name
        }
    }

}

function addData(){
    // console.log(this.target('data-uri'))
    if (artist){
        for(let i = 0; i < 3; i++){
            // displays[i].removeEventListener('click', _ => addData(searchResults[i].uri, artist, searchResults) )
            // display[i].removeEventListener('click', _ => addData(searchResults[i].uri) )
            displays[i].style.backgroundImage = `` 
            artistName[i].innerText = ""
        }
        // artistSeeds.includes(this.dataset.uri) ? true : artistSeeds.push(this.dataset.uri)
    }else{
        for(let i = 0; i < 3; i++){
            // displays[i].removeEventListener('click', _ => addData(searchResults[i].uri, artist, searchResults))
            // display[i].removeEventListener('click', _ => addData(searchResults[i].uri) )
            displays[i].style.backgroundImage = `` 
            artistName[i].innerText = ""
        }
        // trackSeeds.includes(data) ? true : trackSeeds.push(data)
    }

    artist = null
    // console.log(artistSeeds, "tracks" + trackSeeds);

}

async function submit(){
    let response = await fetch('/seed?done=true', {method: 'POST'})
}
