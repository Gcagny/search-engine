'use strict';

const model = 'search';
var request = require('request');
require('stringtools');
var st = require('searchtools');
console.log("t");
/**
 * A set of functions called "actions" for `search`
 */

module.exports = {

  /**
   * Get search entries.
   *
   * @return {Object|Array}
   */

  find: function * () {
    this.model = model;
    try {
      let entries = yield strapi.hooks.blueprints.find(this);
      this.body = entries;
    } catch (err) {
      this.body = err;
    }
  },

  /**
   * Get a specific search.
   *
   * @return {Object|Array}
   */

  findOne: function * () {
    this.model = model;

    try {
      let entry = yield strapi.hooks.blueprints.findOne(this);
      this.body = entry;
    } catch (err) {
      this.body = err;
    }
  },

  requestDistantApi: function * () {
    // === Utilitaires recheches
    // === Appel api encapsulé
    var getApiRes = function(url, keywords, attr){
      return new Promise(function(resolve, reject){
        request(
          url,
          function (error, response, body) {
            if (!error && response.statusCode == 200) {
              try{
                var resultat = st.search(keywords, attr,JSON.parse(body),true,true);
              }
              catch(r)
              {
                  console.log(r);
              }
              resolve(JSON.stringify(resultat));
            }
            else{
              console.log("erreur : "+error);
              console.log("response : "+response.statusCode);
              reject(error);
            }
          }
        );
      });
    };

    // === ACTION sur la route /search/:i/:api/:keywords
    this.model = model;
    try {
      var res;
      let search = yield Search.findOne({id:this.params.id});
      if(search.server[search.server.length-1] != "/")
      {
        search.server = search.server+"/";
      }
      yield getApiRes(search.server+this.params.api, this.params.keywords, search.attributes)
      .then(function(data){
        res = data;
      });
      this.body = JSON.parse(res);

    } catch (err) {
      this.body = console.err;

    }
  },

  /**
   * Create a search entry.
   *
   * @return {Object}
   */

  create: function * () {
    this.model = model;
    try {
      let entry = yield strapi.hooks.blueprints.create(this);
      this.body = entry;
    } catch (err) {
      this.body = err;
    }
  },

  /**
   * Update a search entry.
   *
   * @return {Object}
   */

  update: function * () {
    this.model = model;
    try {
      let entry = yield strapi.hooks.blueprints.update(this);
      this.body = entry;
    } catch (err) {
      this.body = err;
    }
  },

  /**
   * Destroy a search entry.
   *
   * @return {Object}
   */

  destroy: function * () {
    this.model = model;
    try {
      let entry = yield strapi.hooks.blueprints.destroy(this);
      this.body = entry;
    } catch (err) {
      this.body = err;
    }
  },

  /**
   * Add an entry to a specific search.
   *
   * @return {Object}
   */

  add: function * () {
    this.model = model;
    try {
      let entry = yield strapi.hooks.blueprints.add(this);
      this.body = entry;
    } catch (err) {
      this.body = err;
    }
  },

  /**
   * Remove a specific entry from a specific search.
   *
   * @return {Object}
   */

  remove: function * () {
    this.model = model;
    try {
      let entry = yield strapi.hooks.blueprints.remove(this);
      this.body = entry;
    } catch (err) {
      this.body = err;
    }
  }
};

//          ------------------------------
//          ||                          ||
//          ||   Fonction de Recherche  ||
//          ||                          ||
//          ------------------------------
// var parseQuery = function(keywords){ // Split le string de la barre de recherche en un tableau, chaque mot séparé par " " prend une case
//   keywords = _.uniq(keywords.split(" "));
//   return keywords;
// };

// var search = function(keywords, attr, objects, lower, latinize){
//   // === UTILS ====
//   keywords = st.parseQuery(keywords);
//   // Fonction qui vérifie si _a est contenu dans target, si c’est le cas place _o dans output.
//   var testObjProp = function(_a, tgtObj, rootObj, keyword, _output){
//
//     if(_a.name !== undefined){
//       var allIndices = String(tgtObj[_a.name]).allIndicesOf(keyword,true,true).length;
//       var secu =0;
//       if(allIndices > 0){ // Si o.attribut comprend le keyword(le reconnait grace a allindicesof)
//         rootObj.arrNumberPerKeyword[keyword] += allIndices ; // fonction d'incrementation de la value du mot clé en key du tableau associatif
//         if(rootObj.arrKeywordPerAttribut[keyword][_a.name] == undefined)
//         {
//           rootObj.arrKeywordPerAttribut[keyword][_a.name] = allIndices;
//         }
//         else
//           o.scoreN += e;
//     {
//           for(var nb=2; nb < 10;nb++)
//           {
//             if(rootObj.arrKeywordPerAttribut[keyword][_a.name+"."+nb] == undefined && secu == 0)
//             {
//               rootObj.arrKeywordPerAttribut[keyword][_a.name+"."+nb] = allIndices;
//               secu++;
//             }
//           }
//         }
//         _output.push(rootObj); // Push dans le tableau output l'objet si il a match
//
//       }
//     }
//   }
//
//   // Fonction qui parcourt un arbre de sous-propriété
//   var testObjPropTree = function(_a, tgtObj, rootObj, keyword, _output){
//     if(_a.child === undefined){
//       testObjProp(_a, tgtObj, rootObj, keyword, _output);
//     }
//     else{
//       testObjPropTree(_a.child, tgtObj[_a.name], rootObj, keyword, _output);
//     }
//   };
//   // === END UTILS ====
//   // init OUTPUT
//   var output = [];
//
//   _.forEach(objects, function(o){
//     o.score =0; // Nombre de mot clé différent trouvé dans l'objet
//     o.scoreN = 0; // Total du nombre de fois ou chaque mot clé a était trouvé
//     o.arrNumberPerKeyword = {}; // Tableau associatif de stockage de mot clé et leurs valeurs
//     o.arrKeywordPerAttribut = {}; // tableau associatif qui stock pour chaque clé => pour chaque attribut => le nombre d'occurence du keyword
//
//     _.forEach(keywords,function(k){ // Fonction de création du tableau associatif
//       o.arrNumberPerKeyword[k] = 0; // Initialise chaque value a 0
//       o.arrKeywordPerAttribut[k] = {};
//       _.forEach(attr, function(a){
//         testObjPropTree(a, o, o, k, output);
//       });
//     });
//     // ----- Calcul du score || Recupère l'indice du keyword dans le tableau et verifie que sa value est >0;
//     _.forEach(o.arrNumberPerKeyword,function(aKeyword) // récupère le nombre de keyword match
//   {
//     if(aKeyword > 0)
//     {
//       o.score += 1;
//     }
//   });
//     //----- Calcul du scoreN
//     _.forEach(o.arrNumberPerKeyword,function(e){
//       o.scoreN += e;
//     })
//     // Fin Calcul
//   });
//   output = _.uniq(output); // Clean les doublons
//   return output;
// };
