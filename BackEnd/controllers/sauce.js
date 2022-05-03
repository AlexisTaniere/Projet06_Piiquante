const Sauce = require("../Models/sauce");

const fs = require("fs");

exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    const sauce = new Sauce({
      ...sauceObject,
      likes: 0,
      dislikes: 0,
      usersDisliked: [],
      usersLiked: [],
      imageUrl: `${req.protocol}://${req.get("host")}/images/${
        req.file.filename
      }`,
    });
    sauce
      .save()
      .then(() => res.status(201).json({ message: "Sauce enregistrée !" }))
      .catch((error) => res.status(400).json({ error }));
  };

exports.getAllSauces = (req, res, next) => {
    Sauce.find()
      .then((sauces) => {
        res.status(200).json(sauces);
      })
      .catch((error) => {
        res.status(400).json({ error: error });
      });
  };

  exports.getOneSauce = (req, res, next) => {
      Sauce.findOne({_id: req.params.id} )
      .then((sauce) => {
          res.status(200).json(sauce);
      })
      .catch((error) => {
          res.status(404).json({ error });
      });
  };

  exports.modifySauce = (req, res, next) => {
    Sauce.findOne({_id: req.params.id})
    .then(sauce => {
        if (sauce.userId === req.auth) {
          const filename = sauce.imageUrl.split("/images/")[1];
            const sauceObject = req.file ? 
            {
                ...JSON.parse(req.body.sauce),
                imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`
            } : {...req.body};
            if (req.file){
              fs.unlink(`images/${filename}`, () => {
                Sauce.updateOne({_id: req.params.id}, {...sauceObject, _id: req.params.id})
            .then(() => res.status(200).json({message: "Sauce modifiée !"}))
            .catch(error => res.status(500).json({error}));
              })
            }
            else{
              Sauce.updateOne({_id: req.params.id}, {...sauceObject, _id: req.params.id})
            .then(() => res.status(200).json({message: "Sauce modifiée !"}))
            .catch(error => res.status(500).json({error}));
            }
            
        } else {
            return res.status(403).json({error: "Unauthorized request"})
        }
    })
    .catch(error => res.status(500).json({error}));
};

exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({_id: req.params.id})
  .then(sauce => {
      if (sauce.userId === req.auth) {
          const filename = sauce.imageUrl.split("/images/")[1];
          fs.unlink(`images/${filename}`, () => {
              Sauce.deleteOne({_id: req.params.id})
              .then(() => res.status(200).json({message: "Sauce supprimée !"}))
              .catch(error => res.status(400).json({error}));
          })
      } else {
          return res.status(403).json({error: "Requête non autorisée"})
      }
  })
  .catch(error => res.status(500).json({error}));
};

exports.likeSauce = (req, res, next) => {

userId = req.body.userId;
like = req.body.like;
id = req.params.id;

Sauce.findOne({_id: id})
.then(sauce => {
  switch(like){
    case 1 :
        Sauce.updateOne(
          { _id: id },
          { $push: { usersLiked: userId }, $inc: { likes: 1 } }
        ) .then(() => res.status(200).json({message: "Sauce likée !"}))
        .catch(error => res.status(500).json({error}));
        break;

    case -1 :
        Sauce.updateOne(
          { _id: id },
          { $push: { usersDisliked: userId }, $inc: { dislikes: 1 } }
        ) .then(() => res.status(200).json({message: "Sauce dislikée !"}))
        .catch(error => res.status(500).json({error}));
        break;

    case 0 :
      if (sauce.usersLiked.includes(userId)) {
        Sauce.updateOne(
          { _id: id },
          { $pull: { usersLiked: userId }, $inc: { likes: -1 } }
        ) .then(() => res.status(200).json({message: "Like retiré !"}))
        .catch(error => res.status(500).json({error}));
        }
        
      if (sauce.usersDisliked.includes(userId)){
        Sauce.updateOne(
          { _id: id },
          { $pull: { usersDisliked: userId }, $inc: { dislikes: -1 } }
        ) .then(() => res.status(200).json({message: "Dislike retiré !"}))
        .catch(error => res.status(500).json({error}));
        }
        break;
    }

})
.catch(error => res.status(500).json({error}));


};

