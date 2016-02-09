# leviticus

It's a wiki.

Requirements:
* MySQL
* Node

Setup:
* npm install
* copy example config from config folder to /etc/leviticus.json
** customize config to suit
* create your database in MySQL
** execute the setup script

Run:
* node api/api.js
* or use the start.sh script in the api/ folder

Caveats:
* You have to initialize the database by manually creating a Version, as well as an article named Home with one revision. Good luck!
