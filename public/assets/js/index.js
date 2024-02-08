document.addEventListener("DOMContentLoaded", function () {
    // Define the number of bars to display
    const numBars = 30;
  
    // Function to create a status bar element
    function createStatusBar(status, date, downTimes) {
      const statusBar = document.createElement("div");
      statusBar.classList.add("status-bar");
  
      if (status === "DOWN") {
        statusBar.classList.add("orange-bar");
      } else if (status === "UP") {
        statusBar.classList.add("green-bar");
      } else {
        statusBar.classList.add("grey-bar");
      }
  
      // Add event listener to show info box on hover
      statusBar.addEventListener("mouseover", function () {
        showInfoBox(date, downTimes);
      });
  
      // Remove info box on mouseout
      statusBar.addEventListener("mouseout", function () {
        removeInfoBox();
      });
  
      return statusBar;
    }
  
    // Function to create an info box element
    function createInfoBox(date, downTimes) {
      const infoBox = document.createElement("div");
      infoBox.classList.add("info-box");
  
      const formattedDate = formatTimestamp(date, "DD-MM-YYYY");
      const dateText = document.createElement("p");
      dateText.textContent = `Date: ${formattedDate}`;
      infoBox.appendChild(dateText);
  
      if (downTimes && downTimes.length > 0) {
        const timesText = document.createElement("p");
        timesText.textContent = `Down Times: ${downTimes.slice(0, 3).join(", ")}`;
        infoBox.appendChild(timesText);
      }
  
      return infoBox;
    }
  
    // Function to update the status bars for a given section
    async function updateStatusBars(sectionId) {
      const section = document.getElementById(sectionId);
      const statusBarsContainer = section.querySelector(".status-bars");
  
      // Clear existing content
      statusBarsContainer.innerHTML = "";
  
      // Fetch JSON data for the last 30 days
      const jsonPromises = [];
      for (let i = 0; i < numBars; i++) {  // Change the iteration order
        const date = new Date();
        date.setDate(date.getDate() - i);
        const formattedDate = getFormattedDate(date);
        const jsonDataPath = `assets/data/${sectionId.split("-")[0]}/${formattedDate}.json`;
  
        const jsonPromise = fetch(jsonDataPath)
          .then((response) => response.json())
          .catch(() => null);
  
        jsonPromises.push(jsonPromise);
      }
  
      const jsons = await Promise.all(jsonPromises);
  
      // Iterate through the last 30 days of data in reverse order
      for (let i = numBars - 1; i >= 0; i--) {
        const data = jsons[i];
        const status = data ? hasDownStatus(data) ? "DOWN" : "UP" : "UNKNOWN"; // Use "UNKNOWN" for missing data
  
        // Get date and down times for the info box
        const date = new Date();
        date.setDate(date.getDate() - i);
        const downTimes = getDownTimes(data);
  
        // Create status bar
        const statusBar = createStatusBar(status, date, downTimes);
  
        // Append status bar to container
        statusBarsContainer.appendChild(statusBar);
      }
    }
  
    // Check if there is at least one "DOWN" status in the data
    function hasDownStatus(data) {
      return data.some(entry => entry.status === "DOWN");
    }
  
    // Get times when "DOWN" status was found
    function getDownTimes(data) {
      return data ? data.filter(entry => entry.status === "DOWN").map(entry => formatTimestamp(entry.timestamp, "HH:mm")) : [];
    }
  
    // Show info box with date and down times
    function showInfoBox(date, downTimes) {
      // Create info box
      const infoBox = createInfoBox(date, downTimes);
  
      // Append info box to body
      document.body.appendChild(infoBox);
    }
  
    // Remove info box
    function removeInfoBox() {
      const infoBoxes = document.querySelectorAll(".info-box");
      infoBoxes.forEach(box => box.parentNode.removeChild(box));
    }
  
    // Fetch and update status bars for each section
    const sections = ["main-website-section", "dashboard-website-section", "panel-website-section"];
  
    sections.forEach((sectionId) => {
      updateStatusBars(sectionId);
    });
  
    // Function to format timestamp to 12hr time and DD-MM-YYYY format
    function formatTimestamp(timestamp, format) {
      const dateObj = new Date(timestamp);
      const hours = dateObj.getHours();
      const minutes = dateObj.getMinutes();
      const day = dateObj.getDate();
      const month = dateObj.getMonth() + 1;
      const year = dateObj.getFullYear();
  
      const formattedTime = `${(hours % 12) || 12}:${String(minutes).padStart(2, "0")}`;
      const formattedDate = `${String(day).padStart(2, "0")}-${String(month).padStart(2, "0")}-${year}`;
  
      return format.replace("DD", String(day).padStart(2, "0"))
                   .replace("MM", String(month).padStart(2, "0"))
                   .replace("YYYY", year)
                   .replace("HH:mm", formattedTime);
    }
  
    // Function to get formatted date for the file path
    function getFormattedDate(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
  
      return `${day}${month}${year}`;
    }
  });
  