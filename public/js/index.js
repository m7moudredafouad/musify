
const tracks = []

const playNow = (id) => {
    const playerContainer = document.getElementById('container');
    if(playerContainer.firstChild){
        // playerContainer.firstChild.remove()
        playerContainer.innerHTML = '';
    }


    (async () => {
        const res = await fetch(`/music/getInfo/${id}`);
        const data = await res.json()

        const html = `<h2 class="song__title">${data.name}</h2>
            <h4 style="font-size: 12px; margin: 5px 0 17px 0;">uploaded by ${data.artist}</h4>
            <audio id="player" onended="theCurrentAudioEnded()" controls autoplay>
                <source src="/music/${id}" type="audio/mpeg">
                Your browser dose not Support the audio Tag
            </audio>`

        playerContainer.insertAdjacentHTML('beforeend', html)
    })();

}

const pushToTracks = (id) => {
    tracks.push(id)
}

const theCurrentAudioEnded = () => {
    if(tracks.length !== 0){
        playNow(tracks[0])
        tracks.shift()
    }
}


const getTheId = (id) => {
    playNow(id)
}

// For the get more button
const skip = 10
const loc = location.origin + location.pathname;

const next = function(count){
    const query = new URLSearchParams(window.location.search).get('skip');

    if(query === null){
        const query = 0
    }

    const oldSkip = parseInt(query)

    if((skip + oldSkip) < count){

        location.assign(`${loc}?skip=${skip + oldSkip}`)

    } else if((skip + oldSkip) == count || oldSkip == count){
        
        location.assign(`${loc}?skip=0`)

    } else {
        location.assign(`${loc}?skip=0`)
    }

}

const prev = function(count){
    const query = new URLSearchParams(window.location.search).get('skip');

    if(query === null){
        const query = count
    }

    const oldSkip = parseInt(query)

    if((oldSkip - skip) >= 0){

        location.assign(`${loc}?skip=${oldSkip - skip}`)

    } else if(oldSkip == 0){
        location.assign(`${loc}?skip=${count-1}`)
    }else if(oldSkip < skip){
        location.assign(`${loc}?skip=0`)
    } else {
        location.assign(`${loc}?skip=${count-1}`)
        
    }
    

}