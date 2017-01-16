# Search4

Search4 is a social media search engine. It aggregates posts from websites like Google+, Twitter, Tumblr, and Instagram.
This project started as a Yahoo Hackathon project with just one social media output and has grown to include 4 social media outlets.

To run the project go to C:\Path\To\Search4\JScripts\server\ in a terminal window. From there, run the command node search4.js. This should give the output "Search4 is running on port 8080". If you don't want to run on port 8080 you can change the "port" variable on line 37 of search4.js.

Once the command is typed into the terminal, go to "localhost:yourportnumber" in the browser of your choice. You should see a simple landing page. You can type in a query into the search bar at the top of the page. On the following page you should see a list of results from various social media outlets.

You can change the outlets you want results from in C:\Path\To\Search4\JScripts\server\apiconfig.js lines 5-9.

