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

app.post("/register", (req,res) =>{
  const newUserId = generateRandomString();
  const { email, password } = req.body;
  users[newUserId] = {
    id: newUserId,
    email: email,
    password: password
  };
  res.cookie("userId", newUserId);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect('/urls');
});

app.post("/login", (req, res) => {
  const { username } = req.body;
  res.cookie('username', username);
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

app.get("/register", (req, res) => {
  const templateVars= { username: req.cookies["username"] };
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
    username: req.cookies["username"],
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) =>{
  const templateVars = { 
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    username: req.cookies["username"] 
  };
  res.render("urls_show", templateVars);
});

app.get("/urls", (req, res) => {
  const templateVars = { 
    username: req.cookies["username"],
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


