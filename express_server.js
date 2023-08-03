const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");

const { getUserByEmail } = require("./helpers");

app.use(cookieSession({
  name: 'session',
  keys: ['DioBrando'],
}));

app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
  user3RandomID: {
    id: "user3RandomID",
    email: "user3@example.com",
    password: "fruity-pebles",
  },
};

app.use(express.urlencoded({ extended: true }));

app.post("/register", (req, res) => {
  const { email, password } = req.body;
  console.log("Received data from form:", email, password);

  if (email === "" || password === "") {
    return res.status(400).send("Email and password can not be empty.");
  }
  const user = getUserByEmail(email, users);
  if (user) {
    return res.status(400).send("Email already in use.");
  }
  const hashedPassword = bcrypt.hashSync(password, 10);
  const newUserId = generateRandomString();
  users[newUserId] = {
    id: newUserId,
    email: email,
    password: hashedPassword
  };
  console.log("Updated users object:", users);
  req.session.user_id = newUserId;
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/login');
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (email === "" || password === "") {
    return res.status(400).send("Email and password cannot be empty.");
  }
  const user = getUserByEmail(email, users);
  if (!user) {
    return res.status(403).send("No user with that email found.");
  }
  bcrypt.compare(password, user.password, (isPasswordValid) => {
    if (!isPasswordValid) {
      return res.status(403).send("Incorrect password.");
    }

  req.session.user_id = user.id;
  res.redirect('/urls');
  });
});

app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const { updatedURL } = req.body;
  if (urlDatabase.hasOwnProperty(id)) {
    urlDatabase[id] = updatedURL;
    res.redirect("/urls");
  }
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  if (urlDatabase.hasOwnProperty(id)) {
    delete urlDatabase[id];
    res.redirect("/urls");
  }
});

app.post("/urls", (req, res) => {
  const { longURL } = req.body;
  const id = generateRandomString();
  urlDatabase[id] = longURL;
  res.redirect(`/urls/${id}`);
});

app.get("/login", (req, res) => {
  if (req.session.user_id) {
    return res.redirect("/urls");
  }
  const templateVars = {
    user: users[req.session.user_id],
  };
  res.render("login", templateVars);
});

app.get("/register", (req, res) => {
  if (req.session.user_id) {
    return res.redirect("/urls");
  }
  const templateVars = {
    user: users[req.session.user_id],
  };
  res.render("register", templateVars);
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id]
  res.redirect(longURL);
});


app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    return res.redirect('/login');
  }
  const templateVars = {
    user: users[req.session.user_id],
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => { 
  const id = req.params.id;
  const longURL = urlDatabase[id];

  if (!longURL) {
    return res.status(404).send("URL not found.");
  }
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user: users[req.session.user_id]
  };
  res.render("urls_show", templateVars);
});

app.get("/urls", (req, res) => {
  if (!req.session.user_id) {
    return res.status(401).send("You must have an account to shorten urls.");
  }
  const templateVars = {
    user: users[req.session.user_id],
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

// const getUserByEmail = function(email, database) {
//   for (const userId in database) {
//     if (database.hasOwnProperty(userId) && database[userId].email === email) {
//       return database[userId];
//     }
//   }
//   return null;
// };

function generateRandomString() {
  const alphanumericChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';

  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * alphanumericChars.length);
    randomString += alphanumericChars.charAt(randomIndex);
  }

  return randomString;
};

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});