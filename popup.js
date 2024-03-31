function loadTableData(item) {
  const table = document.getElementById("restAPIBody");
  let row = table.insertRow();
  row.addEventListener("click", () => {
    retriggerRequest(item.requestId);
  });

  row.addEventListener("dblclick", () => {
    saveRequestObject(item);
  });

  let method = row.insertCell(0);
  method.innerHTML = item.method;
  let url = row.insertCell(1);
  url.innerHTML = item.url;
  let content = row.insertCell(2);
  content.innerHTML = JSON.stringify(item.requestBody);
}

function retriggerRequest(requestId) {
  chrome.tabs.query({ currentWindow: true, active: true }, (tabArray) => {
    let tabId = tabArray[0].id + "";
    chrome.storage.local.get([tabId], async (result) => {
      let requests = result[tabId];
      if (requests && requests[requestId]) {
        let item = requests[requestId];
        let response = await callApi(item);
        if (response) {
          alert(JSON.stringify(response));
        }
      } else {
        alert("something went wrong!");
      }
    });
  });
}

function saveRequestObject(data) {
  alert("API request object will be downloded as json file");
  if (!data) {
    return;
  }
  filename = "request-body.json";

  if (typeof data === "object") {
    data = JSON.stringify(data, undefined, 4).replace(/\\/g, "");
  }

  const jsonBlob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(jsonBlob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();

  URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

document.addEventListener("DOMContentLoaded", setData);
function setData() {
  chrome.tabs.query({ currentWindow: true, active: true }, (tabArray) => {
    const tabId = tabArray[0].id + "";
    chrome.storage.local.get([tabId], (result) => {
      let requests = result[tabId];
      if (requests) {
        const keys = Object.keys(requests);
        keys.forEach((entry) => {
          let item = requests[entry];
          if (item) {
            loadTableData(item);
          }
        });
      }
    });
  });
}

document.getElementById("search").addEventListener("keyup", search);
function search() {
  var input, filter, table, tr, td, i, txtValue;
  input = document.getElementById("search");
  filter = input.value.toUpperCase();
  table = document.getElementById("apiMonitorTable");
  tr = table.getElementsByTagName("tr");
  for (i = 0; i < tr.length; i++) {
    td = tr[i].getElementsByTagName("td")[1];
    if (td) {
      txtValue = td.textContent || td.innerText;
      if (txtValue.toUpperCase().indexOf(filter) > -1) {
        tr[i].style.display = "";
      } else {
        tr[i].style.display = "none";
      }
    }
  }
}

let responseDiv = document.getElementById("responseContainer");

async function callApi(item) {
  let apiBody;
  if (item.formData) {
    apiBody = new FormData();
    for (const key in item.formData) {
      apiBody.append(key, item.formData[key]);
    }
  } else if (item.requestBody) {
    apiBody = JSON.stringify(item.requestBody);
  }
  const response = await fetch(item.url, {
    method: item.method,
    headers: item.headers,
    body: apiBody,
  })
    .then(async (response) => {
      if (response.status === 204) {
        return "Response: 204 No Content";
      }
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        response.json().then((jsonData) => {
          responseDiv.innerText = JSON.stringify(jsonData, null, 2);
        });
      } else if (contentType && contentType.includes("text/html")) {
        response.text().then((htmlData) => {
          responseDiv.innerHTML = htmlData;
        });
      } else if (contentType && contentType.includes("image/png")) {
        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);
        const imgElement = document.createElement("img");
        imgElement.src = imageUrl;
        responseContainer.appendChild(imgElement);
      } else {
        response.text().then((respText) => {
          responseDiv.innerText = respText;
        });
      }
      return;
    })
    .catch((error) => {
      alert("Error fetching API:", error);
    });

  return response;
}
