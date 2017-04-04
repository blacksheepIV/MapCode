/**
 * Created by blackSheep on 03-Apr-17.
 */
var headerCtrl = function($scope){
    $scope.availableSearchParams = [
        { key: "name", name: "Name", placeholder: "Name..." },
        { key: "city", name: "City", placeholder: "City..." },
        { key: "country", name: "Country", placeholder: "Country..." },
        { key: "emailAddress", name: "E-Mail", placeholder: "E-Mail...", allowMultiple: true },
        { key: "job", name: "Job", placeholder: "Job..." }
    ];
}//end of headerCtrl
