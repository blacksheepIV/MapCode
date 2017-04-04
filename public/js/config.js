/**
 * Created by blackSheep on 27-Mar-17.
 */
mapCodeApp.config(function($mdThemingProvider) {

    // Configure a dark theme with primary foreground grey

    $mdThemingProvider.theme('docs-dark', 'default')
        .primaryPalette('grey')
        .accentPalette('yellow')
        .warnPalette('red')
        .dark();
});
