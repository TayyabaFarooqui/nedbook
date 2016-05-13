/**
 * Created by Tayyaba Farooqui on 4/3/2016.
 */


(function(){

  angular.module('starter')
    .service('RequestsService', ['$http', '$q', '$ionicLoading',  RequestsService]);

  function RequestsService($http, $q, $ionicLoading,$scope){

    var base_url = 'http://192.168.0.100:3000';

    function register(device_token,id){
      console.log('id' + id);
     var temp={
        STD_ID:JSON.stringify(id),
        TOKEN:JSON.stringify(device_token)

      };

      var deferred = $q.defer();
      console.log('going to acess api');
     // console.log(stuid);
      $ionicLoading.show();

  //  $http.put('http://192.168.1.104:3000/register', {'device_token': device_token})

       $http.put('http://192.168.1.105:3000/pp/'+id,temp)

        .success(function(response){
          console.log("sarah 1");
          $ionicLoading.hide();
          deferred.resolve(response);

        })
        .error(function(data){
          deferred.reject();
        });


      return deferred.promise;

    };


    return {
      register: register
    };
  }
})();
