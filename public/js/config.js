/**
 * Created by blackSheep on 27-Mar-17.
 */
mapCodeApp.config(function($mdThemingProvider,localStorageServiceProvider) {

    // Configure a dark theme with primary foreground grey

    $mdThemingProvider.theme('docs-dark', 'default')
        .primaryPalette('grey')
        .accentPalette('yellow')
        .warnPalette('red')
        .dark();
    //************************************************************************************
    localStorageServiceProvider
        .setNotify(true, true);//in case of setItem and removeItem the $rootScope wil be notified
});
