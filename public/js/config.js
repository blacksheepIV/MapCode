/**
 * Created by blackSheep on 27-Mar-17.
 */
mapCodeApp.config(function ($mdThemingProvider, localStorageServiceProvider, toastrConfig) {

    // Configure a dark theme with primary foreground grey

    $mdThemingProvider.theme('docs-dark', 'default')
        .primaryPalette('grey')
        .accentPalette('yellow')
        .warnPalette('red')
        .dark();
    $mdThemingProvider.theme('NewTheme', 'default')
        .primaryPalette('blue-grey')
        .accentPalette('cyan')
        .warnPalette('orange')
        .dark();
    $mdThemingProvider.theme('agreedGreen', 'default')
        .primaryPalette('green')
        .accentPalette('lime')
        .warnPalette('yellow')
        .dark();
    //************************************************************************************
    localStorageServiceProvider
        .setNotify(true, true);//in case of setItem and removeItem the $rootScope wil be notified
    /* ############################################################################################## */
    angular.extend(toastrConfig, {
        autoDismiss: false,
        containerId: 'toast-container',
        maxOpened: 0,
        newestOnTop: true,
        positionClass: 'toast-bottom-left',
        preventDuplicates: false,
        preventOpenDuplicates: false,
        target: 'body'
    });

});
