const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const cookieParser = require("cookie-parser");

app.use(cookieParser());

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
  if (email === "" || password === "") {
    return res.status(400).send("Email and password can not be empty.");
  }
  let emailAlreadyUsed = false;
  for (const userId in users) {
    if (users.hasOwnProperty(userId) && users[userId].email === email) {
      emailAlreadyUsed = true;
    }
  }
  if (emailAlreadyUsed) {
    return res.status(400).send("Email alreay in use.");
  }
  const newUserId = generateRandomString();
  users[newUserId] = {
    id: newUserId,
    email: email,
    password: password
  };
  res.cookie("user_id", newUserId);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect('/login');
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (email === "" || password === "") {
    return res.status(400).send("Email and password cannot be empty.");
  }
  let user;
  for (const userId in users) {
    if (users.hasOwnProperty(userId) && users[userId].email === email) {
      user = users[userId];
    }
  }
  if (!user) {
    return res.status(403).send("No user with that email found.");
  }
  if (user.password !== password) {
    return res.status(403).send("Incorrect password.");
  }
  res.cookie('user_id', user.id);
  res.redirect('/urls');
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

app.get("/login", (req, res) => {
  const templateVars = {
    user: req.user,
  };
  res.render("login", templateVars);
});

app.get("/register", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]] };
  res.render("register", templateVars);
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id]
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  const { longURL } = req.body;
  const id = generateRandomString();
  urlDatabase[id] = longURL;
  res.redirect(`/urls/${id}`);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_show", templateVars);
});

app.get("/urls", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
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


