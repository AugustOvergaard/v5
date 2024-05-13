function getGeoLocation(continueWith) {
    navigator.geolocation.getCurrentPosition((position) => {
        continueWith(position, true);
    }, (error) => {
        continueWith(null, false)

    })
}
