module.exports = {
    connect: connectUser(SpotifyWebApi),
};

function connectUser(SpotifyWebApi){
    const scopes = ['user-read-private', 'user-read-email'],
    redirectUri = 'http://moodchime.heroku.app',
    clientId = '1f3c90c77fce4b60bd9e18d35175bd86',
    state = 'some-state-of-my-choice';
  
    // Setting credentials can be done in the wrapper's constructor, or using the API object's setters.
    const spotifyApiUser = new SpotifyWebApi({
        redirectUri: redirectUri,
        clientId: clientId
    });
    
    // Create the authorization URL
    const authorizeURL = spotifyApi.createAuthorizeURL(scopes, state);
    
    // https://accounts.spotify.com:443/authorize?client_id=5fe01282e44241328a84e7c5cc169165&response_type=code&redirect_uri=https://example.com/callback&scope=user-read-private%20user-read-email&state=some-state-of-my-choice
    console.log(authorizeURL);
}