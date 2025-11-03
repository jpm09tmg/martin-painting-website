<!-- Admin: Login Functionality -->

Used ChatGPT to ask for restricting access to admin pages and session handling
Result: ChatGPT gave me code that restricts admin pages through layout.js, adds session handling with AuthProvider

<!-- Admin: Clients Page Update -->

Wanted to make admin pages consistent so I asked Claude to copy the stat cards and general styling from Quotes/Appointments page.
Result: Claude provided the updated page for client page
I'd rather have a table so I asked Claude to just change it into a simple table.
Result: Table that is hooked to database (Can't edit form yet)

<!-- Admin: Clients Page Update 10-28 -->
Asked Claude to show the appointment count per client and then to link to the appointments page
Result: Claude did as asked, with an extra column on the clients table for the number of appointments the client has
Asked Claude to validate email to prevent duplicates
Result: did as asked but message only shows up on the main page instead of the modal so I asked it to add it in the modal too
Result: Claude added message inside modal too

<!-- Admin: Payments Page Update -->
Asked Claude to copy stat cards and general format of Clients page that I just asked to change. 
Result: similar table from clients as well

<!-- Database Updates -->
Asked Claude to connect my database clients table to appointments table.
Result: AI helped me link the joined tables so that editing one field changes the other

<!-- Admin: Appointments Page Update -->
Asked Claude to create dropdown menu by getting clients from table in database.
Result: Claude did as asked, just changing the client input field into a select with options from the table.

<!-- Admin: Appointments Page Update 11-03 -->
Asked Claude to create confirmation modal to decline appointments and/or mark appointments as complete
Result: Claude did as asked

<!-- Admin: Quotes Page Update -->
Asked Claude to update the page so that it uses the joined clients + appointments table, and we only need to pick from a dropdown menu
Result: AI helped create as I asked, but it wouldn't connect to quote_items table as I forgot I was using a test table instead
I duplicated the table then asked Claude to try again using my test tables

<!-- Admin: Project Page Update -->
Asked Claude to update Project Page so that it links clients + appointments + quotes. 
Result: Claude did as asked and created an extra status option
Took out the status option then asked Claude to make the view details button functional
Result: Modal now shows will all available details for the project.