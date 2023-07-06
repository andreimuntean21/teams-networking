import "./style.css";

let allTeams = [];
let editId;

function $(selector) {
  return document.querySelector(selector);
}

function deleteTeamRequest(id, callback) {
  return fetch("http://localhost:3000/teams-json/delete", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ id })
  })
    .then(r => r.json())
    .then(status => {
      if (typeof callback === "function") {
        callback(status);
      }
      return status;
    });
}

function updateTeamRequest(team) {
  return fetch("http://localhost:3000/teams-json/update", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(team)
  }).then(r => r.json());
}

function createTeamRequest(team) {
  return fetch("http://localhost:3000/teams-json/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(team)
  }).then(r => r.json());
}

function getTeamAsHtml({ id, promotion, members, name, url }) {
  const displayUrl = url.startsWith("https://github.com/") ? url.substring(19) : url;
  return `<tr>

    <td>${promotion}</td>

    <td>${members}</td>

    <td>${name}</td>

    <td><a href="${url}" target="_blank">${displayUrl}</a></td>

    <td>
    <a data-id="${id}" class="remove-btn">✖</a>
    <a data-id="${id}" class="edit-btn">&#9998;</a>
    </td>

    </tr>`;
}

let previewDisplayTeams = [];

function displayTeams(teams) {
  if (teams === previewDisplayTeams) {
    console.warn("same teams already displayed");
    return;
  }

  if (teams.length === previewDisplayTeams.length) {
    if (teams.every((team, i) => team === previewDisplayTeams[i])) {
      console.warn("sameContent");
      return;
    }
  }

  previewDisplayTeams = teams;
  console.warn("displayTeams", teams);
  const teamsHTML = teams.map(getTeamAsHtml);

  $("#teamsTable tbody").innerHTML = teamsHTML.join("");
}

function loadTeamsRequest() {
  return fetch("http://localhost:3000/teams-json", {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    }
  }).then(r => r.json());
}

/**
 * 
 * @returns {Promise<Team[]>}
 */

function loadTeams() {
    return loadTeamsRequest().then(teams => {
      allTeams = teams;
      displayTeams(teams);
      return teams;
    });
}

function startEdit(id) {
  editId = id;
  const team = allTeams.find(team => team.id == id);
  setTeamValues(team);
}

function setTeamValues({ promotion, members, name, url }) {
  $("#promotion").value = promotion;
  $("#members").value = members;
  $("input[name=name]").value = name;
  $("input[name=url]").value = url;
}

function getTeamValues() {
  const promotion = $("#promotion").value;
  const members = $("#members").value;
  const name = $("input[name=name]").value;
  const url = $("input[name=url]").value;
  return {
    promotion,
    members,
    name: name,
    url: url
  };
}

function onSubmit(e) {
  e.preventDefault();

  const team = getTeamValues();

  if (editId) {
    team.id = editId;
    updateTeamRequest(team).then(({ success }) => {
      if (success) {
        allTeams = allTeams.map(t => {
          if (t.id === editId) {
            console.warn("team", team);
            //return team;
            // return  {...team}
            return {
              ...t,
              ...team
            };
          }
          return t;
        });

        displayTeams(allTeams);
        $("#teamsForm").reset();
      }
    });
  } else {
    createTeamRequest(team).then(status => {
      if (status.success) {
        //console.info("saved", JSON.parse(JSON.stringify(team)));
        team.id = status.id;
        //allTeams.push(team);
        allTeams = [...allTeams, team];
        displayTeams(allTeams);

        $("#teamsForm").reset();
      }
    });
  }
}

function filterElements(elements, search) {
  search = search.toLowerCase();
  return elements.filter(element => {
    return Object.entries(element).some(([key, value]) => {
      if (key !== "id") {
        return value.toLowerCase().includes(search);
      }
    });
  });
}

function initEvents() {
  $("#searchTeams").addEventListener("input", e => {
    const teams = filterElements(allTeams, e.target.value);
    displayTeams(teams);
  });

  $("#teamsTable tbody").addEventListener("click", e => {
    if (e.target.matches("a.remove-btn")) {
      const id = e.target.dataset.id;
      deleteTeamRequest(id, ({ success }) => {
        if (success) {
          loadTeams();
        }
      });
    } else if (e.target.matches("a.edit-btn")) {
      const id = e.target.dataset.id;
      startEdit(id);
    }
  });

  $("#teamsForm").addEventListener("submit", onSubmit);
  $("#teamsForm").addEventListener("reset", () => {
    displayTeams(allTeams);
    console.warn("reset");
    editId = undefined;
  });
}

function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}

(async() => {
  console.info("1. start sleeping...");
  await sleep(2000);
  console.warn("2. ready to do %o", "next job");
})();

initEvents();


(async () => {
  $("#teamsForm").classList.add("loading-mask");
  // loadTeams().then(teams => {
  //   console.warn("teams", teams);
  //   $("#teamsForm").classList.remove("loading-mask");
  // })
  const teams = await loadTeams();
  $("#teamsForm").classList.remove("loading-mask");
})();
