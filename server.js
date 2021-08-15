//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const pluralize = require("pluralize");
const port = process.env.PORT || 3000;

const app = express();

app.set("view engine", "ejs");
mongoose.set('useUnifiedTopology', true);
mongoose.set('useNewUrlParser', true);

app.use(express.static("public"));
app.use(bodyParser.urlencoded({
  extended: true
}));

// connect with animalShelterDB
//mongoose.connect(uri);
mongoose.connect("mongodb+srv://KaiZa29:Test1234@animalshelterparadise.a8dlh.mongodb.net/animalShelterDB?retryWrites=true&w=majority");

// create structure for animals collection in animalShelterDB
const animalSchema = ({
  name: String,
  type: String,
  age: String,
  image: String,
  description: String
});

// create structe for messages collection in animalShelterDB
const messageSchema = ({
  fName: String,
  lName: String,
  email: String,
  message: String
});

// create new collection called "messages"
const Message = mongoose.model("Message", messageSchema);

// create new collection called "animals"
const Animal = mongoose.model("Animal", animalSchema);

app.get("/", function(req, res) {
  res.render("index");
});

app.get("/About", function(req, res) {
  res.render("about");
})

// show all animals from database
app.get("/Animals", function(req, res) {
  Animal.find({}, function(err, animals) {
    if (!err) {
      res.render("animals", {
        animalArray: animals
      });
    } else {
      console.log(err);
    };
  });
});

// show animals filtered by animalType
app.get("/Animals/:animalType", function(req, res) {
  const requestedAnimal = req.params.animalType;
  const emptyMessage = "No " + pluralize(requestedAnimal) + " here at the moment. Please check back later."

  if (requestedAnimal === "all") {
    res.redirect("/Animals");
  } else {
    Animal.find({
      type: requestedAnimal
    }, function(err, animals) {
      if (!err) {
        res.render("animals", {
          emptyMessage: emptyMessage,
          animalArray: animals,
          requestedAnimal: requestedAnimal
        });
      } else {
        console.log(err);
      };
    });
  };
});

app.get("/Contact", function(req, res) {
  res.render("contact");
})

app.get("/Add", function(req, res) {
  res.render("add");
})

app.get("/SelectUpdate", function(req, res) {
  Animal.find({}, function(err, animals) {
    if (!err) {
      res.render("selectUpdate", {
        animalArray: animals,
      });
    } else {
      console.log(err);
    };
  });
});

app.get("/CheckMessages", function(req, res) {
  const count = 0;

  Message.find({}, function(err, messages) {
    if (!err) {
      res.render("messages", {
        messageArray: messages,
        count: count
      });
    } else {
      console.log(err);
    };
  });
});

app.get("/Delete", function(req, res) {
  Animal.find({}, function(err, animals) {
    if (!err) {
      res.render("delete", {
        animalArray: animals
      });
    } else {
      console.log(err);
    };
  });
});

app.get("/DeleteMessage/:messageID", function(req, res) {
  const messageID = req.params.messageID;

  Message.findByIdAndDelete(messageID, function(err, message) {
    if (!err) {
      res.redirect("/CheckMessages");
    } else {
      console.log(err);
    };
  });
});

app.post("/Contact", function(req, res) {
  const message = new Message({
    fName: req.body.fName,
    lName: req.body.lName,
    email: req.body.email,
    message: req.body.message
  });

  message.save(function(err) {
    if (!err) {
      res.render("thankyou");
    } else {
      console.log(err);
    };
  });
});

app.post("/Add", function(req, res) {
  const animal = new Animal({
    name: req.body.animalName,
    type: req.body.animalType,
    age: req.body.animalAge,
    image: req.body.animalImage,
    description: req.body.animalDescription
  });

  animal.save(function(err) {
    if (!err) {
      res.redirect("/Animals");
    } else {
      console.log(err);
    };
  });
});

app.post("/Update", function(req, res) {
  const animalToUpdate = req.body.selectedAnimal;

  Animal.findOne({
    _id: animalToUpdate
  }, function(err, entry) {
    if (!err) {
      res.render("Update", {
        animal: entry
      });
    } else {
      console.log(err);
    };
  });
});

app.post("/Delete", function(req, res) {
  const animalToDelete = req.body.selectedAnimal;

  Animal.findOneAndDelete({
    name: animalToDelete
  }, function(err, entry) {
    if (!err) {
      res.render("ThankYouDeleted");
    } else {
      console.log(err);
    };
  });
});

app.post("/UpdateAnimal", function(req, res) {
  const animalID = req.body.animalID;
  const animalImage = req.body.animalImage;

  // check if animalImage is updated by user
  if (animalImage === undefined && typeof animalImage == 'undefined') {
    Animal.findByIdAndUpdate(animalID, {
      name: req.body.animalName,
      type: req.body.animalType,
      age: req.body.animalAge,
      description: req.body.animalDescription
    }, function(err, result) {
      if (!err) {
        res.redirect("/Animals");
      } else {
        console.log(err);
      }
    });
  } else {
    Animal.findByIdAndUpdate(animalID, {
      name: req.body.animalName,
      type: req.body.animalType,
      age: req.body.animalAge,
      image: animalImage,
      description: req.body.animalDescription
    }, function(err, result) {
      if (!err) {
        res.redirect("/Animals");
      } else {
        console.log(err);
      }
    });
  }
});

app.get("/FindOutMore/:animalID", function(req, res) {
  animalID = req.params.animalID;

  Animal.findOne({
      _id: animalID
    },
    function(err, entry) {
      if (!err) {
        res.render("FindOutMore", {
          animal: entry
        });
      } else {
        console.log(err);
      };
    });
});

app.listen(port, function() {
  console.log("Server is running on port " + port + ".");
});
