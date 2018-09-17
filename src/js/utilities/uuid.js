/*
 * GUID generator
 *
 * taken from this post: https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
 */
module.exports = function() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}
