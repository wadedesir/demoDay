document.querySelector('.playCard').addEventListener('click', playPage)

function playPage(){
    window.location.href = "/player";
}

function toggleBtn(btn){
    btn == "play" ? document.querySelector('#play').classList.toggle('hideControl') : document.querySelector('#pause').classList.toggle('hideControl')
}