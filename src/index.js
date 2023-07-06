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
    body: JSON.stringify({ id: id })
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

function getTeamAsHtml(team) {
  return `<tr>

    <td>${team.promotion}</td>

    <td>${team.members}</td>

    <td>${team.name}</td>

    <td>${team.url}</td>

    <td>
    <a data-id="${team.id}" class="remove-btn">✖</a>
    <a data-id="${team.id}" class="edit-btn">&#9998;</a>
    </td>

    </tr>`;
}
let previewDisplayTeams = [];
function displayTeams(teams) {
  if (previewDisplayTeams === teams) {
    console.warn("same teams already displayed");
    return;
  }
  previewDisplayTeams = teams;
  console.warn("displayTeams", teams);
  const teamsHTML = teams.map(getTeamAsHtml);

  $("#teamsTable tbody").innerHTML = teamsHTML.join("");
}

function loadTeams() {
  fetch("http://localhost:3000/teams-json", {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    }
  })
    .then(r => r.json())

    .then(teams => {
      allTeams = teams;
      displayTeams(teams);
    });
}

function startEdit(id) {
  editId = id;
  const team = allTeams.find(team => team.id == id);
  setTeamValues(team);
}

function setTeamValues(team) {
  $("#promotion").value = team.promotion;
  $("#members").value = team.members;
  $("input[name=name]").value = team.name;
  $("input[name=url]").value = team.url;
}

function getTeamValues() {
  const promotion = $("#promotion").value;
  const members = $("#members").value;
  const name = $("input[name=name]").value;
  const url = $("input[name=url]").value;
  const team = {
    promotion,
    members,
    name: name,
    url: url
  };
  return team;
}

function onSubmit(e) {
  e.preventDefault();

  const team = getTeamValues();

  if (editId) {
    team.id = editId;
    updateTeamRequest(team).then(status => {
      if (status.success) {
        //const i = allTeams.findIndex(t => t.id === editId);
        //allTeams[i] = team;

        const edited = allTeams.find(t => t.id === editId);
        Object.assign(edited, team);

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
    return Object.entries(element).some(entry => {
      if (entry[0] !== "id") {
        return entry[1].toLowerCase().includes(search);
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
      deleteTeamRequest(id).then(status => {
        if (status.success) {
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

loadTeams();
initEvents();
