function parse(text) {
  // Normalize line endings and split the text into lines
  const lines = text.replace(/\r\n/g, '\n').split('\n');

  // Initialize the data structure
  let data = {
    request: {
      method: '',
      url: '',
      headers: {}
    },
    response: {
      status: '',
      headers: {},
      body: {}
    }
  };

  // Flags and placeholders to track the current section and store data
  let inRequestHeaders = false;
  let inResponseHeaders = false;
  let jsonBodyStartIndex = null;

  // Iterate through each line, parsing as you go
  lines.forEach((line, index) => {
    if (line.startsWith("GET")) {
      inRequestHeaders = true;
      const [method, url] = line.split(' ');
      data.request.method = method;
      data.request.url = url.split(' ')[0]; // Remove HTTP/1.1 from the URL
    } else if (line.startsWith("HTTP/1.1")) {
      inResponseHeaders = true;
      data.response.status = line;
    } else if (inRequestHeaders && line.trim() === '') {
      inRequestHeaders = false; // End of request headers
    } else if (inResponseHeaders && line.trim() === '') {
      inResponseHeaders = false; // End of response headers
    } else if (inRequestHeaders) {
      // Parsing request headers
      const [key, value] = line.split(': ');
      if (key && value) {
        data.request.headers[key] = value.trim();
      }
    } else if (inResponseHeaders) {
      // Parsing response headers
      const [key, value] = line.split(': ');
      if (key && value) {
        data.response.headers[key] = value.trim();
      }
    } else if (!inRequestHeaders && !inResponseHeaders && line.trim()) {
      // Identify the start of the JSON body
      if (line.trim().startsWith("{") && jsonBodyStartIndex === null) {
        jsonBodyStartIndex = index;
      }
    }
  });

  // Attempt to parse the collected response body as JSON
  if (jsonBodyStartIndex !== null) {
    const responseBody = lines.slice(jsonBodyStartIndex).join(' ');
    try {
      data.response.body = JSON.parse(responseBody);
    } catch (e) {
      console.error('Error parsing JSON body:', e.message);
    }
  }

  return data;
}

module.exports = {
  parse
};
