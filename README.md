# `API Debug Mate` Chrome Extension

The `API Debug Mate` Chrome Extension is designed to help developers thoroughly test backend applications by allowing them to make API calls directly from the extension. Developers can view all API calls made by a webpage, re-hit any API call to get the response, and download the request object as JSON for further analysis.


## Features

- View all API calls made by the webpage.
- Search and filter out apis.
- Click on any API call to re-hit the API in same session without having to set any headers or session if and view the response.
- Download the request object as JSON for detailed analysis. Request object contains:
    - Url
    - Method type
    - Headers
    - Request Body/ Form data (if any)


## Limitation

To manage the large number of API calls made from web pages, the extension includes a default filter that excludes endpoints containing the word `static`, or those that end with `.css` or `.js`.
This filter aligns with the convention that API endpoints often include static resources like stylesheets (.css) or scripts (.js), which are typically not relevant for API testing purposes.
Excluding such endpoints helps prevent the table from growing excessively tall, making it easier for users to browse and manage the API calls effectively
```java
if (url.includes("assets") || 
    url.endsWith(".css") || 
    url.endsWith(".js")) {
    return; //exclude
}
```


## Usage

1. Open a webpage where API calls are being made.
2. Click on the `API Debug Mate` Chrome Extension icon to open the extension.
3. The extension will display all API calls made by the webpage.
4. Click on any API row to re-hit the API and view the response.
5. Double-click on an API call to download the request object as JSON.


## Installation

1. Clone or download the repository to your local machine.
2. Open Google Chrome and go to `chrome://extensions/`.
3. Enable Developer mode in the top right corner.
4. Click on "Load unpacked" and select the extension folder.


## Contributing

Contributions are welcome! If you encounter any issues or have suggestions for improvement, please open an issue or submit a pull request.
