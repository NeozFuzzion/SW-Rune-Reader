// Define the API endpoint
const url = "https://swarfarm.com/api/v2/monsters/";
const fs = require("fs");

async function fetchMonsters() {
  let monsters = {};
  let nextUrl = url;

  try {
    while (nextUrl) {
      console.log(`Fetching data from: ${nextUrl}`);
      const response = await fetch(nextUrl);

      if (response.ok) {
        const data = await response.json();

        // Add monsters to the dictionary
        data.results.forEach((monster) => {
          monsters[monster.com2us_id] = {
            name: monster.name,
            image_filename: monster.image_filename,
            element: monster.element,
          };
        });

        // Update the next URL
        nextUrl = data.next;
      } else {
        console.error(`Failed to fetch data. Status code: ${response.status}`);
        break;
      }
    }

    // Write the monsters to a JSON file
    fs.writeFileSync("./src/data/monsters_data.json", JSON.stringify(monsters, null, 4));
    console.log("Monsters data has been saved to 'monsters.json'.");
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

fetchMonsters();
