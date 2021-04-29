const user = require("./models/user");

module.exports = {
    setup: duatoneSetup,
    start: duatone
};

function duatoneSetup(SpotifyWebApi) { //generate duatonePlayer and User objects
    const duatonePlayer = new SpotifyWebApi({
        clientId: '1f3c90c77fce4b60bd9e18d35175bd86',
        clientSecret: '8758a46abe0a4ff2abb77245a9b64c2d',
        redirectUri: 'https://duatone.herokuapp.com/connect'
    });

    //generate spotify auth url for user
    const scopes = ['user-read-private', 'user-read-email', 'user-read-recently-played', 'user-top-read', 'user-modify-playback-state', 'user-follow-read', 'user-library-modify', 'user-library-read', 'streaming', 'user-read-playback-state', 'user-read-currently-playing', 'app-remote-control'],
        redirectUri = 'https://duatone.herokuapp.com/connect',
        clientId = '1f3c90c77fce4b60bd9e18d35175bd86',
        state = 'duatone';

    // Setting credentials can be done in the wrapper's constructor, or using the API object's setters.
    const duatoneUser = new SpotifyWebApi({
        redirectUri: redirectUri,
        clientId: clientId
    });

    // Create the authorization URL
    const authorizeURL = duatoneUser.createAuthorizeURL(scopes, state);
    // https://accounts.spotify.com:443/authorize?client_id=5fe01282e44241328a84e7c5cc169165&response_type=code&redirect_uri=https://example.com/callback&scope=user-read-private%20user-read-email&state=some-state-of-my-choice

    return [duatonePlayer, duatoneUser, authorizeURL]
}


function duatone(app, duatonePlayer, User) {
    let duatonePlayerDevice
    let duatonePlayerDeviceId
    let firstRunTracks
    app.get('/initializePlayer', isLoggedIn, async function (req, res) {
        availableDevices = await duatonePlayer.getMyDevices()
            .catch(error => console.error(error))

        console.log(availableDevices.body.devices);
        duatonePlayerDevice = availableDevices.body.devices.filter(device => device.name == "Duatone Player")
        console.log("device: ", duatonePlayerDevice)
        duatonePlayerDeviceId = [duatonePlayerDevice[0].id]

        duatonePlayer.transferMyPlayback(duatonePlayerDeviceId)
            .then(function () {
                console.log('Transfering playback to duatone Player: ' + duatonePlayerDeviceId);
            }, function (err) {
                //if the user making the request is non-premium, a 403 FORBIDDEN response code will be returned
                console.log('Something went wrong while transferring playback!', err);
            });

        res.json("success")
    })

    app.get('/token', isLoggedIn, function (req, res) { //returns spotify access token
        // convert whatever we want to send (preferably should be an object) to JSON
        const JSONdata = JSON.stringify(req.user.security.accessToken);
        res.send(JSONdata);
    })

    app.get('/seed', isLoggedIn, async function (req, res) {
        res.render('seed.ejs')
    })

    app.post('/seed', isLoggedIn, async function (req, res) {

        const user = await User.findById(req.user._id)
        artists = req.query.artists.split(',')
        tracks = req.query.tracks.split(',')
        user.songData.artists = artists
        user.songData.songs = tracks
        // console.log('artist: ', artists, 'tracks: ', req.query.tracks);
        user.setup = 3 //update server side access token
        const result = await user.save()
            .then(result => {
                res.json('success')
            })
            .catch(error => console.error(error))

    })

    app.get('/player', isLoggedIn, async function (req, res) {
        res.render('player.ejs', {
            loggedIn: true,
            user: req.user.name.first
        });
    })



    app.get('/pause', isLoggedIn, async function (req, res) {
        const result = await duatonePlayer.pause()
            .catch(err => {
                console.log('Something went wrong!', err);
            })
        res.json("success")
    })

    app.get('/play', isLoggedIn, async function (req, res) {
        // console.log('OUR URIS', req.query.tracks.split(','));
        if (req.query.tracks) {
            const result = await duatonePlayer.play({
                    uris: req.query.tracks.split(',')
                })
                .catch(err => {
                    console.log('Something went wrong!', err);
                    res.json("fail")
                })
        } else {
            const result = await duatonePlayer.play()
                .catch(err => {
                    console.log('Something went wrong!', err);
                    res.json("success")
                })
        }
        res.json("success")
    })

    app.get('/search', isLoggedIn, async function (req, res) {
        // res.setHeader('Content-Type', 'application/json');

        if (req.query.artist) {
            console.log('Search artists by ' + req.query.artist);

            let result = await duatonePlayer.searchArtists(req.query.artist, {
                    limit: 3
                })
                .catch(err => console.log(err))
            // console.log("query items: ", result.body.artists.items)
            res.json(result.body.artists.items)

        } else if (req.query.track) {

            let result = await duatonePlayer.searchTracks(`track:${req.query.track}`, {
                    limit: 3
                })
                .catch(err => console.log(err))
            // console.log("query items: ", result.body.tracks.items)
            res.json(result.body.tracks.items)

        }

        res.json("success")
    })

    app.get('/queue', isLoggedIn, async function (req, res) { 
        // let artist1 = Math.
        ///shuffing algrithm:
        //https://stackoverflow.com/questions/19269545/how-to-get-a-number-of-random-elements-from-an-array
        let randArtists = req.user.songData.artists.sort(() => 0.5 - Math.random());
        let randSong = req.user.songData.songs.sort(() => 0.5 - Math.random());
        let randArtistSeeds = [randArtists[0], randArtists[1]]
        let recs = []

        recs[0] = await duatonePlayer.getRecommendations({
                limit: 5,
                target_energy: 0.1,
                target_tempo: 0.1,
                seed_artists: randArtistSeeds,
                seed_tracks: randSong[0],
                min_popularity: 30
            })
            .catch(err => console.log(err))
        recs[1] = await duatonePlayer.getRecommendations({
                limit: 5,
                target_energy: 0.2,
                target_tempo: 0.2,
                seed_artists: randArtistSeeds,
                seed_tracks: randSong[0],
                min_popularity: 40
            })
            .catch(err => console.log(err))
        recs[2] = await duatonePlayer.getRecommendations({
                limit: 5,
                target_energy: 0.4,
                target_tempo: 0.2,
                seed_artists: randArtistSeeds,
                seed_tracks: randSong[0],
                min_popularity: 40
            })
            .catch(err => console.log(err))
        recs[3] = await duatonePlayer.getRecommendations({
                limit: 5,
                target_energy: 0.6,
                target_tempo: 0.5,
                seed_artists: randArtistSeeds,
                seed_tracks: randSong[0],
                min_popularity: 40
            })
            .catch(err => console.log(err))
        recs[4] = await duatonePlayer.getRecommendations({
            limit: 3,
            target_energy: 0.8,
            target_tempo: 0.7,
            seed_artists: randArtistSeeds,
            seed_tracks: randSong[0],
            min_popularity: 40
        })
        .catch(err => console.log(err))
        recs[5] = await duatonePlayer.getRecommendations({
                limit: 5,
                target_energy: 0.9,
                target_tempo: 0.9,
                seed_artists: randArtistSeeds,
                seed_tracks: randSong[0],
                min_popularity: 40
            })
            .catch(err => console.log(err))
        // console.log(recs.body.tracks)
        // recs[0].body.tracks = recs[0].body.tracks.sort(() => 0.5 - Math.random());


        trackUris = recs.reduce( (acc,rec) => {
            acc.push(rec.body.tracks.map(track => track.uri))
            return acc
        }, [])
        trackUris = trackUris.flat()
        // trackUris = recs.body.tracks.map(track => track.uri)
        // firstRunTracks = trackUris 
        res.json(trackUris)
        // res.redirect('/playStart')
    })

    app.get('/tracks', isLoggedIn, async function (req, res) {
        let tracks = req.query.songs.split(',')
        // tracks
        console.log(tracks);
        trackData = await duatonePlayer.getTracks(tracks)
        res.json(trackData)
    })

    app.get('/recents', isLoggedIn, async function (req, res) {

        let recents = req.user.songData.recents
        res.json(recents)
    })

    app.post('/recents', isLoggedIn, async function (req, res) {
        let recents = req.user.songData.recents
        console.log(recents)
        console.log(req.body)
        recents = req.body.concat(recents)

        const user = await User.findById(req.user._id)
        console.log(req.body)
        user.songData.recents = recents
        const result = await user.save()
            .then(result => {
                res.json('success')
            })
            .catch(error => console.error(error))
        res.json("success")
    })

    app.get('/sketches', isLoggedIn, async function (req, res) {
        let sketches = req.user.activities.sketches
        res.json(sketches)
    })

    // app.post('/saveSketch', isLoggedIn, async function (req, res) {
    //     let newSketch = req.body.dataURL
    //     console.log(req.body)
    //     let sketches = req.user.activities.sketches
    //     sketches.push(newSketch)

    //     const user = await User.findById(req.user._id)
    //     user.activities.sketches = sketches
    //     const result = await user.save()
    //         .then(result => {
    //             res.json('success')
    //         })
    //         .catch(error => console.error(error))

    //     res.json('success')
    // })

    // app.get('/playStart', isLoggedIn, async function (req, res) {   
    //     const result = await duatonePlayer.play({uris: firstRunTracks})
    //     .catch(err => {
    //         console.log('Something went wrong!', err);
    //     })
    //     res.json("success")
    // })  
}

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }

    res.redirect('/login');
}