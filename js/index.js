const NOROFF_API_URL = "https://v2.api.noroff.dev";

//function to creat a post -- creat a new file post.js and exclude it from this js file
async function createPost(title, body, apiKey, accessToken) {
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      "X-Noroff-API-Key": apiKey,
    },
    body: JSON.stringify({
      title: title,
      body: body,
    }),
  };

  const response = await fetch(`${NOROFF_API_URL}/social/posts`, options);
  const responseJson = await response.json();
  console.log("created post ", { createdPost: responseJson });
  return responseJson;
}

async function listPosts(apiKey, accessToken) {
  const options = {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "X-Noroff-API-Key": apiKey,
    },
  };

  const response = await fetch(`${NOROFF_API_URL}/social/posts`, options);
  const responseJson = await response.json();
  console.log("all posts ", { allPosts: responseJson });
  return responseJson;
}

function isLoggedIn(email) {
  return localStorage.getItem("logged-in-email") === email;
}

function isRegistered(email) {
  return localStorage.getItem(`${email}-registered`) ? true : false;
}

// REGISTER FUNCTION
async function register(email, password) {
  if (!email.endsWith("@noroff.no") && !email.endsWith("@stud.noroff.no")) {
    return false;
  }
  if (isRegistered(email)) {
    return true;
  }
  const response = await fetch(`${NOROFF_API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: email,
      password: password,
      name: "zebra", // TODO: Add name input field
    }),
  });
  if (response.status === 400) {
    const responseJson = await response.json();
    if (responseJson.errors[0].message === "Profile already exists") {
      localStorage.setItem(`${email}-registered`, true);
      return true;
    }
  }
  if (!response.ok) {
    return false;
  }
  localStorage.setItem(`${email}-registered`, true);
  return true;
}

// LOGIN FUNCTION
async function login(email, password) {
  if (!email.endsWith("@noroff.no") && !email.endsWith("@stud.noroff.no")) {
    return false;
  }
  if (!isRegistered(email)) {
    return false;
  }
  if (isLoggedIn(email)) {
    return true;
  }
  const loginResponse = await fetch(`${NOROFF_API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: email,
      password: password,
    }),
  });
  if (!response.ok) {
    return false;
  }
  const loginResponseJson = await loginResponse.json();
  const accessToken = loginResponseJson.data.accessToken;
  localStorage.setItem("access-token", accessToken);

  const apiKeyResponse = await fetch(`${NOROFF_API_URL}/auth/create-api-key`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      name: "User api key",
    }),
  });
  const apiKeyResponseJson = await apiKeyResponse.json();
  const apiKey = apiKeyResponseJson.data.key;
  localStorage.setItem("api-key", apiKey);
  localStorage.setItem("logged-in-email", email);
  return true;
}

//SIGN IN BUTTON
document.getElementById("signIn").addEventListener("submit", function (event) {
  event.preventDefault();
  const email = event.target[0].value;
  const password = event.target[1].value;
  login(email, password).then((loggedIn) => {
    if (loggedIn) {
      window.location.href = "/html/profile/index.html";
    } else {
      alert("Invalid email or password. Please try again.");
    }
  });
});

//REGISTER BUTTON
document.getElementById("register").addEventListener("click", function (event) {
  event.preventDefault();
  console.log(event);
  const email = document.getElementById("form-email").value;
  const password = document.getElementById("Password").value;
  register(email, password).then((registered) => {
    if (registered) {
      alert("User registered. Please log in.");
    } else {
      alert("Invalid email or password. Please try again.");
    }
  });
});

//IF USER IS ALREADY LOGGED IN, CAN GET RIGHT AWAY IN THE PROFILE.HTML WITHOUT LOGING IN AGAIN
window.addEventListener("load", () => {
  if (localStorage.getItem("logged-in-email")) {
    window.location.href = "/html/profile/index.html";
  }
});
