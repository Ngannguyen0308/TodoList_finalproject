let baseUrl = "http://dev.thanqminh.com:3000/";
var user = null;

async function getInfor() {
  if (user == null) {
    try {
      const savedLogin = await checkAccessToken();
      if (savedLogin) {
        document.getElementById("email").setAttribute("value", user.uid);
        document.getElementById("firstname").setAttribute("value", user.name);
      }
    } catch {}
  }
}

const checkAccessToken = async () => {
  user = JSON.parse(await localStorage.getItem("user"));
  try {
    const response = await fetch(`${baseUrl}/profile`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...user,
      },
    });

    localStorage.setItem("user", JSON.stringify(user));
    const body = await response.json();
    user.name = body.name;

    return true;
  } catch {
    return false;
  }
};

async function updateAccount() {
  if (user != null) {
    let name = firstname.value;

    const response = await fetch(`${baseUrl}/auth`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...user,
      },
      body: JSON.stringify({
        name,
      }),
    });

    user.name = name;

    if (response.ok) {
      alert("Your account has been updated~");
    } else {
      alert("Account update failed. Please try again!");
    }
  }
}
