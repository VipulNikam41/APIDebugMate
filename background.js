(() => {
  const tabStorage = {};
  const networkFilters = {
    urls: ["<all_urls>"],
  };

  chrome.webRequest.onBeforeSendHeaders.addListener(
    (details) => {
      const { tabId, requestId } = details;
      if (!tabStorage.hasOwnProperty(tabId)) {
        return;
      }
      if (!tabStorage[tabId]) {
        return;
      }

      let reqHeaders = {};
      details.requestHeaders.forEach((header) => {
        reqHeaders[header.name] = header.value;
      });

      const request = tabStorage[tabId].requests[requestId];
      if (!request) {
        return;
      }
      Object.assign(request, {
        headers: reqHeaders,
      });
      const data = tabStorage[tabId].requests;
      setStorageData(tabId, data);
    },
    networkFilters,
    ["requestHeaders"]
  );

  chrome.webRequest.onBeforeRequest.addListener(
    (details) => {
      const { tabId, requestId } = details;
      if (!tabStorage.hasOwnProperty(tabId)) {
        return;
      }

      if (!tabStorage[tabId]) {
        tabStorage[tabId] = {
          id: tabId,
          requests: {},
          registerTime: new Date().getTime(),
        };
      }

      if (
        details.url.includes("assets") ||
        details.url.endsWith(".css") ||
        details.url.endsWith(".js")
      ) {
        return;
      }

      // if (details && details.requestBody) {
      //   console.log("url", details.url);
      //   console.log("request", getRequestBody(details));
      //   console.log("form", getFormData(details));
      // }

      tabStorage[tabId].requests[requestId] = {
        requestId: requestId,
        method: details.method,
        url: details.url,
        requestBody: getRequestBody(details),
        formData: getFormData(details),
      };

      const data = tabStorage[tabId].requests;
      setStorageData(tabId, data);
    },
    networkFilters,
    ["requestBody", "extraHeaders"]
  );

  chrome.tabs.onActivated.addListener((tab) => {
    const tabId = tab ? tab.tabId : chrome.tabs.TAB_ID_NONE;
    if (!tabStorage.hasOwnProperty(tabId)) {
      tabStorage[tabId] = {
        id: tabId,
        requests: {},
        registerTime: new Date().getTime(),
      };
    }
  });

  chrome.tabs.onRemoved.addListener((tab) => {
    const tabId = tab;
    if (!tabStorage.hasOwnProperty(tabId)) {
      return;
    }
    tabStorage[tabId] = null;
    clearStorageData(tabId);
  });
})();

const setStorageData = (tabId, data) =>
  chrome.storage.local.set({ [tabId + ""]: data }, function () {
    var error = chrome.runtime.lastError;
    if (error) {
      console.log("Error :: setStorageData :: ", error);
    }
  });

const clearStorageData = (tabId) =>
  chrome.storage.local.remove([tabId + ""], function () {
    var error = chrome.runtime.lastError;
    if (error) {
      console.log("Error :: clearStorageData :: ", error);
    }
});

function getRequestBody(details) {
  if (details && details.requestBody && details.requestBody.raw) {
    let str = decodeURIComponent(
      String.fromCharCode.apply(
        null,
        new Uint8Array(details.requestBody.raw[0].bytes)
      )
    );
    return JSON.parse(str);
  }
}

function getFormData(details) {
  if (details && details.requestBody && details.requestBody.formData) {
    return details.requestBody.formData;
  }
}